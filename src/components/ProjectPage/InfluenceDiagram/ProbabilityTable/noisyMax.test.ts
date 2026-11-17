import { describe, expect, it } from 'vitest';
import {
	applyRestrictions,
	buildModel,
	calculateConfiguration,
	combineNoisyMax,
	getIncompleteRows,
	NoisyMaxModel,
	pullsDown,
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
		expect(pullsDown([0.7, 0.2, 0.1], down)).toBe(true);
		expect(pullsDown([0.7, 0.2, 0.1], [0.4, 0.4, 0.2])).toBe(false);
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
