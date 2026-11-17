import { describe, expect, it } from 'vitest';
import {
	applyRestrictions,
	buildModel,
	calculateConfiguration,
	combineNoisyMax,
	getIncompleteRows,
	NoisyMaxModel,
	compareToLeak,
	makeBaseline,
	startNoisyMax,
} from './noisyMax';
import { roundProbabilities } from './probabilityTableMath';

// The worked example in Figma (Dot Design, frame 7): Oil price with parents Drill well and Market
const model: NoisyMaxModel = {
	parents: [
		{ issueId: 'drill', states: [{ id: 'yes' }, { id: 'no' }] },
		{ issueId: 'market', states: [{ id: 'weak' }, { id: 'medium' }, { id: 'strong' }] },
	],
	baselines: { drill: 'no', market: 'weak' },
	leak: [0.7, 0.2, 0.1],
	rows: {
		drill: { yes: [0.4, 0.4, 0.2] },
		market: { medium: [0.5, 0.3, 0.2], strong: [0.2, 0.4, 0.4] },
	},
};
const calc = (path: string[]) => roundProbabilities(calculateConfiguration(model, path));

describe('Noisy-MAX', () => {
	it('returns the leak when every parent is at its baseline', () => {
		expect(calc(['no', 'weak'])).toEqual([0.7, 0.2, 0.1]);
	});
	it('returns the parameter row when one parent is away from its baseline', () => {
		expect(calc(['yes', 'weak'])).toEqual([0.4, 0.4, 0.2]);
		expect(calc(['no', 'strong'])).toEqual([0.2, 0.4, 0.4]);
	});
	it('combines parents that push independently', () => {
		expect(calc(['yes', 'medium'])).toEqual([0.286, 0.425, 0.289]);
		expect(calc(['yes', 'strong'])).toEqual([0.114, 0.419, 0.467]);
	});
	it('caps a row that would pull the outcome down', () => {
		const down = [0.9, 0.1, 0];
		expect(compareToLeak([0.7, 0.2, 0.1], down)).toBe('lower');
		expect(compareToLeak([0.7, 0.2, 0.1], [0.4, 0.4, 0.2])).toBe('ok');
		expect(compareToLeak([0.22, 0.29, 0.49], [0.03, 0.93, 0.04])).toBe('mixed');
		expect(roundProbabilities(combineNoisyMax([0.7, 0.2, 0.1], [down]))).toEqual([
			0.7, 0.2, 0.1,
		]);
	});
	it('lists parameter rows that are missing or do not sum to 1', () => {
		expect(getIncompleteRows(model)).toEqual([]);
		const incomplete = {
			...model,
			rows: { ...model.rows, market: { medium: [0.5, 0.3, 0.1] } },
		};
		expect(getIncompleteRows(incomplete)).toEqual([
			{ issueId: 'market', stateId: 'medium' },
			{ issueId: 'market', stateId: 'strong' },
		]);
		expect(getIncompleteRows({ ...model, leak: [0, 0, 0] })).toEqual([{}]);
	});
	it('falls back to the first state when the baseline is unknown', () => {
		const fallback = { ...model, baselines: {} };
		expect(roundProbabilities(calculateConfiguration(fallback, ['yes', 'weak']))).toEqual([
			0.7, 0.2, 0.1,
		]);
	});
	it('gives restricted outcomes 0 and rescales the rest', () => {
		expect(applyRestrictions([0.4, 0.4, 0.2], [false, false, true])).toEqual([0.5, 0.5, 0]);
	});
});

describe('Noisy-OR', () => {
	// With two outcomes Noisy-MAX is the leaky noisy-OR (Henrion's parameters, leak included):
	// P(absent | causes) = (1 − leak) · Π (1 − p_i) / (1 − leak)
	it('matches the leaky noisy-OR formula', () => {
		const leak = 0.1;
		const p = [0.6, 0.3];
		const absent = (1 - leak) * ((1 - p[0]) / (1 - leak)) * ((1 - p[1]) / (1 - leak));
		const result = combineNoisyMax(
			[1 - leak, leak],
			p.map(value => [1 - value, value]),
		);
		expect(result[0]).toBeCloseTo(absent, 10);
		expect(result[1]).toBeCloseTo(1 - absent, 10);
	});
});

describe('makeBaseline', () => {
	it('swaps the leak and the new baseline row', () => {
		const settings = {
			enabled: true,
			view: 'parameters' as const,
			baselines: { drill: 'yes' },
			leak: { low: 0.2, high: 0.8 },
			rows: { drill: { no: { low: 0.9, high: 0.1 } } },
		};
		const next = makeBaseline(settings, model.parents[0], 'no');
		expect(next.baselines.drill).toBe('no');
		expect(next.leak).toEqual({ low: 0.9, high: 0.1 });
		expect(next.rows.drill.yes).toEqual({ low: 0.2, high: 0.8 });
	});
});

describe('startNoisyMax', () => {
	const parents = model.parents;
	const ids = ['low', 'medium', 'high'];
	const table = [
		{ path: ['yes', 'weak'], values: [0.4, 0.4, 0.2] },
		{ path: ['yes', 'medium'], values: [0.1, 0.1, 0.8] },
		{ path: ['no', 'weak'], values: [0, 0, 0] },
		{ path: ['yes', 'strong'], values: [0, 0, 0] },
	];
	it('starts each parameter row from the table row it describes', () => {
		const started = startNoisyMax(undefined, parents, table, ids);
		expect(started.baselines).toEqual({ drill: 'yes', market: 'weak' });
		expect(started.leak).toEqual({ low: 0.4, medium: 0.4, high: 0.2 });
		expect(started.rows).toEqual({ market: { medium: { low: 0.1, medium: 0.1, high: 0.8 } } });
	});
	it('picks the state that keeps the outcome lowest as the baseline', () => {
		const started = startNoisyMax(
			undefined,
			parents,
			[
				{ path: ['yes', 'weak'], values: [0.1, 0.2, 0.7] },
				{ path: ['no', 'weak'], values: [0.6, 0.3, 0.1] },
				{ path: ['no', 'medium'], values: [0.4, 0.4, 0.2] },
			],
			ids,
		);
		expect(started.baselines).toEqual({ drill: 'no', market: 'weak' });
		expect(started.leak).toEqual({ low: 0.6, medium: 0.3, high: 0.1 });
	});
	it('keeps earlier parameters', () => {
		const earlier = { ...startNoisyMax(undefined, parents, table, ids), enabled: false };
		expect(startNoisyMax(earlier, parents, [], ids)).toEqual({ ...earlier, enabled: true });
	});
	it('builds a model in scale order', () => {
		const started = startNoisyMax(undefined, parents, table, ids);
		const built = buildModel(started, parents, ids, [2, 1, 0]);
		expect(built.leak).toEqual([0.2, 0.4, 0.4]);
		expect(built.rows.drill.no).toEqual([0, 0, 0]);
	});
});
