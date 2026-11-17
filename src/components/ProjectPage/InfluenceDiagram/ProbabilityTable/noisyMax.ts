import { roundProbabilities, toScale } from './probabilityTableMath';
import type { NoisyMaxSettings } from './useProbabilityTableSettings';
import { isRowSumValid } from './utils';

// All arrays here are in scale order (lowest outcome first).

const EPSILON = 1e-9;

const cumulative = (values: number[]) => {
	let total = 0;
	return values.map(value => (total += value));
};

export const isDistribution = (values: number[]) =>
	values.length > 0 &&
	values.every(value => value >= 0) &&
	isRowSumValid(values.reduce((a, b) => a + b, 0));

export type LeakComparison = 'ok' | 'lower' | 'mixed';

/**
 * Noisy-MAX assumes a parent can only push the outcome up the scale. 'lower': the row sits
 * lower on the scale than the leak everywhere, so it has no effect (usually a sign that this
 * state should be the baseline). 'mixed': it pushes up at some levels and down at others; the
 * downward part has no effect.
 */
export const compareToLeak = (leak: number[], row: number[]): LeakComparison => {
	const leakCdf = cumulative(leak);
	const rowCdf = cumulative(row);
	const down = rowCdf.some((value, i) => value > leakCdf[i] + 1e-6);
	const up = rowCdf.some((value, i) => value < leakCdf[i] - 1e-6);
	if (!down) return 'ok';
	return up ? 'mixed' : 'lower';
};

/** Average position on the scale (0 = lowest outcome) */
const expectedPosition = (values: number[]) => values.reduce((sum, value, i) => sum + value * i, 0);

/**
 * Noisy-MAX with leak. Each active row is "this parent alone in this state, every other parent
 * at its baseline", so it already includes the leak. Parents push independently and the outcome
 * ends at the highest level any of them reaches:
 * P(Y ≤ y | x) = L(y) · Π (P_i(Y ≤ y) / L(y))
 */
export const combineNoisyMax = (leak: number[], activeRows: number[][]): number[] => {
	const leakCdf = cumulative(leak);
	const rowCdfs = activeRows.map(cumulative);
	const cdf = leakCdf.map((leakValue, y) => {
		if (y === leakCdf.length - 1) return 1;
		if (leakValue <= EPSILON) return 0;
		// A ratio above 1 would pull the outcome down; cap it so the parent has no effect there
		return rowCdfs.reduce(
			(product, rowCdf) => product * Math.min(1, rowCdf[y] / leakValue),
			leakValue,
		);
	});
	for (let y = 1; y < cdf.length; y++) cdf[y] = Math.max(cdf[y], cdf[y - 1]);
	return cdf.map((value, y) => Math.max(0, value - (y ? cdf[y - 1] : 0)));
};

/** Restricted outcomes get 0; the rest is rescaled to sum to 1 and rounded. */
export const applyRestrictions = (values: number[], disabled: boolean[]): number[] => {
	const enabled = values.map((value, i) => (disabled[i] ? 0 : value));
	const total = enabled.reduce((a, b) => a + b, 0);
	if (total <= EPSILON) return roundProbabilities(enabled);
	return roundProbabilities(enabled.map(value => value / total));
};

export type NoisyMaxParent = { issueId: string; states: { id: string }[] };

export type NoisyMaxModel = {
	parents: NoisyMaxParent[];
	baselines: Record<string, string>;
	/** Leak in scale order */
	leak: number[];
	/** parent issue id → state id → row in scale order */
	rows: Record<string, Record<string, number[]>>;
};

export const getBaseline = (parent: NoisyMaxParent, baselines: Record<string, string>) =>
	parent.states.some(state => state.id === baselines[parent.issueId])
		? baselines[parent.issueId]
		: parent.states[0]?.id;

/** Parameter rows still missing or not summing to 1; empty when the table can be calculated. */
export const getIncompleteRows = (model: NoisyMaxModel) => {
	const missing: { issueId?: string; stateId?: string }[] = [];
	if (!isDistribution(model.leak)) missing.push({});
	model.parents.forEach(parent => {
		const baseline = getBaseline(parent, model.baselines);
		parent.states.forEach(state => {
			if (state.id === baseline) return;
			const row = model.rows[parent.issueId]?.[state.id];
			if (!row || !isDistribution(row))
				missing.push({ issueId: parent.issueId, stateId: state.id });
		});
	});
	return missing;
};

/** One configuration of the full table: the state id per parent, in parent order. */
export const calculateConfiguration = (model: NoisyMaxModel, path: string[]): number[] => {
	const active = model.parents.flatMap((parent, i) => {
		const state = path[i];
		if (state === getBaseline(parent, model.baselines)) return [];
		const row = model.rows[parent.issueId]?.[state];
		return row ? [row] : [];
	});
	return combineNoisyMax(model.leak, active);
};

const toRecord = (ids: string[], values: number[]) =>
	Object.fromEntries(ids.map((id, i) => [id, values[i]]));

/** Stored parameters (by outcome id) as a model in scale order */
export const buildModel = (
	settings: NoisyMaxSettings,
	parents: NoisyMaxParent[],
	outcomeIds: string[],
	order: number[],
): NoisyMaxModel => {
	const scale = (record: Record<string, number> | undefined) =>
		toScale(
			outcomeIds.map(id => record?.[id] ?? 0),
			order,
		);
	return {
		parents,
		baselines: settings.baselines,
		leak: scale(settings.leak),
		rows: Object.fromEntries(
			parents.map(parent => [
				parent.issueId,
				Object.fromEntries(
					parent.states.map(state => [
						state.id,
						scale(settings.rows[parent.issueId]?.[state.id]),
					]),
				),
			]),
		),
	};
};

/**
 * Turning Noisy-MAX on. Earlier parameters are kept. The first time, each parameter row starts
 * from the table row it describes (leak: every parent at baseline; a parent row: only that
 * parent away from baseline), so values already typed there are not lost.
 */
export const startNoisyMax = (
	previous: NoisyMaxSettings | undefined,
	parents: NoisyMaxParent[],
	configurations: { path: string[]; values: number[] }[],
	outcomeIds: string[],
	/** Column indexes low → high */
	order: number[] = outcomeIds.map((_, i) => i),
): NoisyMaxSettings => {
	if (previous) return { ...previous, enabled: true };
	const filled = configurations.filter(configuration =>
		configuration.values.some(value => value !== 0),
	);
	// Baseline: the state that keeps the outcome lowest on the scale. States are compared only
	// against each other with the other parents' states held the same, so their effect cancels
	// out. Without enough values, the first state.
	const pickBaseline = (parent: NoisyMaxParent, p: number) => {
		const contexts = new Map<string, Map<string, number>>();
		filled.forEach(({ path, values }) => {
			const context = path.filter((_, i) => i !== p).join('|');
			if (!contexts.has(context)) contexts.set(context, new Map());
			contexts.get(context)!.set(path[p], expectedPosition(toScale(values, order)));
		});
		const scores = new Map<string, number[]>();
		contexts.forEach(byState => {
			if (byState.size < 2) return;
			const mean = [...byState.values()].reduce((a, b) => a + b, 0) / byState.size;
			byState.forEach((position, state) =>
				scores.set(state, [...(scores.get(state) ?? []), position - mean]),
			);
		});
		let best = parent.states[0]?.id ?? '';
		let bestScore = Infinity;
		parent.states.forEach(state => {
			const list = scores.get(state.id);
			if (!list) return;
			const score = list.reduce((a, b) => a + b, 0) / list.length;
			if (score < bestScore - 1e-9) {
				best = state.id;
				bestScore = score;
			}
		});
		return best;
	};
	const baselines = Object.fromEntries(
		parents.map((parent, p) => [parent.issueId, pickBaseline(parent, p)]),
	);
	const find = (path: string[]) =>
		configurations.find(
			configuration =>
				configuration.path.every((state, i) => state === path[i]) &&
				configuration.values.some(value => value !== 0),
		)?.values;
	const basePath = parents.map(parent => baselines[parent.issueId]);
	const leak = find(basePath);
	const rows: NoisyMaxSettings['rows'] = {};
	parents.forEach((parent, p) => {
		parent.states.forEach(state => {
			if (state.id === baselines[parent.issueId]) return;
			const values = find(basePath.map((id, i) => (i === p ? state.id : id)));
			if (!values) return;
			rows[parent.issueId] = {
				...rows[parent.issueId],
				[state.id]: toRecord(outcomeIds, values),
			};
		});
	});
	return {
		enabled: true,
		view: 'parameters',
		baselines,
		leak: leak ? toRecord(outcomeIds, leak) : {},
		rows,
	};
};

/**
 * Make a state the parent's baseline. The leak and that state's row swap places: the old leak
 * becomes the row for the old baseline. Both describe "only this parent differs", so no values
 * are lost. Other parents' rows are kept as they are.
 */
export const makeBaseline = (
	settings: NoisyMaxSettings,
	parent: NoisyMaxParent,
	stateId: string,
): NoisyMaxSettings => {
	const previous = getBaseline(parent, settings.baselines);
	const rows = settings.rows[parent.issueId] ?? {};
	return {
		...settings,
		baselines: { ...settings.baselines, [parent.issueId]: stateId },
		leak: rows[stateId] ?? {},
		rows: {
			...settings.rows,
			[parent.issueId]: { ...rows, [previous]: settings.leak },
		},
	};
};
