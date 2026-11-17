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

/**
 * True when a parameter row puts more weight on low outcomes than the leak does. Noisy-MAX
 * assumes a parent can only push the outcome up, so such a row is capped when combined.
 */
export const pullsDown = (leak: number[], row: number[]) => {
	const leakCdf = cumulative(leak);
	return cumulative(row).some((value, i) => value > leakCdf[i] + 1e-6);
};

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
): NoisyMaxSettings => {
	if (previous) return { ...previous, enabled: true };
	const baselines = Object.fromEntries(
		parents.map(parent => [parent.issueId, parent.states[0]?.id ?? '']),
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
