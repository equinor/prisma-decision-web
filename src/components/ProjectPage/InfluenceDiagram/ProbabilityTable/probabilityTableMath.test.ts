import { describe, expect, it } from 'vitest';
import {
	defaultDefinition,
	definitionsEqual,
	definitionTypes,
	fillLastEmpty,
	fixProbabilitySum,
	formatDefinition,
	getDefinitionProbabilities,
	isRowValid,
	migrateDefinition,
	ProbabilityCell,
	rebalanceRow,
	resolveScaleOrder,
	roundProbabilities,
	rowSum,
	validateDefinition,
} from './probabilityTableMath';

const cell = (value: number, locked = false, disabled = false): ProbabilityCell => ({
	value,
	locked,
	disabled,
});
const quoted = (text: string, name: string) => `${text} '${name}'`;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const values = (cells: ProbabilityCell[]) => cells.map(c => c.value);

describe('rowSum / isRowValid', () => {
	it('ignores disabled cells', () => {
		expect(rowSum([cell(0.4), cell(0.6), cell(0.9, false, true)])).toBeCloseTo(1);
		expect(isRowValid([cell(0.4), cell(0.6), cell(0.9, false, true)])).toBe(true);
	});
	it('is valid when everything is disabled', () => {
		expect(isRowValid([cell(0, false, true)])).toBe(true);
	});
	it('is invalid when the sum is off', () => {
		expect(isRowValid([cell(0.4), cell(0.4)])).toBe(false);
	});
});

describe('roundProbabilities', () => {
	it('sums exactly to 1 for thirds', () => {
		const result = roundProbabilities([1 / 3, 1 / 3, 1 / 3]);
		expect(result).toEqual([0.334, 0.333, 0.333]);
		expect(Number(sum(result).toFixed(10))).toBe(1);
	});
	it('preserves the total with many values', () => {
		const raw = Array.from({ length: 7 }, () => 1 / 7);
		expect(Number(sum(roundProbabilities(raw)).toFixed(10))).toBe(1);
	});
	it('respects decimals and avoids float noise', () => {
		expect(roundProbabilities([0.123456, 0.876544], 2)).toEqual([0.12, 0.88]);
		expect(roundProbabilities([0.1, 0.2, 0.7])).toEqual([0.1, 0.2, 0.7]);
	});
	it('handles empty input', () => {
		expect(roundProbabilities([])).toEqual([]);
	});
});

describe('fixProbabilitySum', () => {
	it('returns a valid row unchanged', () => {
		const cells = [cell(0.5), cell(0.5)];
		expect(fixProbabilitySum(cells, { type: 'equal' }).cells).toBe(cells);
	});
	it('does not mutate the input', () => {
		const cells = [cell(0.2), cell(0.2)];
		fixProbabilitySum(cells, { type: 'proportional' });
		expect(values(cells)).toEqual([0.2, 0.2]);
	});
	it('scales proportionally', () => {
		const { cells, error } = fixProbabilitySum([cell(0.1), cell(0.3)], {
			type: 'proportional',
		});
		expect(error).toBeUndefined();
		expect(values(cells)).toEqual([0.25, 0.75]);
	});
	it('preserves locked values when proportional', () => {
		const { cells } = fixProbabilitySum([cell(0.5, true), cell(0.1), cell(0.3)], {
			type: 'proportional',
		});
		expect(values(cells)).toEqual([0.5, 0.125, 0.375]);
	});
	it('splits equally when all unlocked values are 0 (proportional)', () => {
		const { cells } = fixProbabilitySum([cell(0.4, true), cell(0), cell(0)], {
			type: 'proportional',
		});
		expect(values(cells)).toEqual([0.4, 0.3, 0.3]);
	});
	it('spreads the discrepancy equally', () => {
		const { cells } = fixProbabilitySum([cell(0.1), cell(0.3), cell(0.2)], { type: 'equal' });
		expect(values(cells)).toEqual([0.234, 0.433, 0.333]);
	});
	it('clamps and redistributes when equal spread hits 0', () => {
		const { cells } = fixProbabilitySum([cell(0.9), cell(0.05), cell(0.3)], { type: 'equal' });
		expect(cells.every(c => c.value >= 0 && c.value <= 1)).toBe(true);
		expect(Number(sum(values(cells)).toFixed(10))).toBe(1);
		expect(cells[1].value).toBe(0);
	});
	it('clamps and redistributes when equal spread hits 1', () => {
		const { cells } = fixProbabilitySum([cell(0.9), cell(0.0), cell(0.0)], { type: 'equal' });
		expect(Number(sum(values(cells)).toFixed(10))).toBe(1);
		expect(cells.every(c => c.value >= 0 && c.value <= 1)).toBe(true);
	});
	it('rounds so the row sums to exactly 1', () => {
		const { cells } = fixProbabilitySum([cell(0.1), cell(0.1), cell(0.1)], { type: 'equal' });
		expect(Number(sum(values(cells)).toFixed(10))).toBe(1);
		expect(values(cells).sort()).toEqual([0.333, 0.333, 0.334]);
	});
	it('does not touch locked or disabled cells', () => {
		const input = [cell(0.3, true), cell(0.2, false, true), cell(0.1), cell(0.1)];
		for (const fix of [{ type: 'proportional' }, { type: 'equal' }] as const) {
			const { cells } = fixProbabilitySum(input, fix);
			expect(cells[0].value).toBe(0.3);
			expect(cells[1].value).toBe(0.2);
			expect(cells[0].locked).toBe(true);
			expect(cells[1].disabled).toBe(true);
			expect(Number(sum([cells[0].value, cells[2].value, cells[3].value]).toFixed(10))).toBe(
				1,
			);
		}
	});
	it('puts the whole discrepancy on one outcome', () => {
		const { cells, error } = fixProbabilitySum([cell(0.2), cell(0.3)], {
			type: 'outcome',
			index: 1,
		});
		expect(error).toBeUndefined();
		expect(values(cells)).toEqual([0.2, 0.8]);
	});
	it('errors when the outcome is locked or disabled', () => {
		const locked = fixProbabilitySum([cell(0.2, true), cell(0.3)], {
			type: 'outcome',
			index: 0,
		});
		expect(locked.error).toBeTruthy();
		const disabled = fixProbabilitySum([cell(0.2), cell(0.3), cell(0, false, true)], {
			type: 'outcome',
			index: 2,
		});
		expect(disabled.error).toBeTruthy();
	});
	it('errors when the outcome would leave [0, 1]', () => {
		const result = fixProbabilitySum([cell(0.1), cell(0.9), cell(0.9)], {
			type: 'outcome',
			index: 0,
		});
		expect(result.error).toBeTruthy();
		expect(values(result.cells)).toEqual([0.1, 0.9, 0.9]);
	});
	it('errors when there are no unlocked enabled cells', () => {
		const result = fixProbabilitySum([cell(0.2, true), cell(0.3, true)], { type: 'equal' });
		expect(result.error).toBeTruthy();
	});
	it('errors when locked cells exceed 1', () => {
		const result = fixProbabilitySum([cell(0.7, true), cell(0.6, true), cell(0.1)], {
			type: 'proportional',
		});
		expect(result.error).toBeTruthy();
	});
});

describe('getDefinitionProbabilities', () => {
	const none = (n: number) => Array<boolean>(n).fill(false);
	const ok = (result: ReturnType<typeof getDefinitionProbabilities>) => {
		if ('error' in result) throw new Error(result.error);
		return result.values;
	};

	it('Normal n=5 centre 0.5 sd 0.2 is symmetric, truncated at 0 and 1, and sums to 1', () => {
		const v = ok(getDefinitionProbabilities({ type: 'Normal', centre: 0.5, sd: 0.2 }, none(5)));
		// Slices of 0.2 are ±0.5, ±1.5, ±2.5 SD; the mass outside 0–1 is dropped and rescaled
		expect(v[2]).toBeCloseTo(0.388, 2);
		expect(v[1]).toBeCloseTo(0.245, 2);
		expect(v[0]).toBeCloseTo(0.061, 2);
		expect(Math.abs(v[0] - v[4])).toBeLessThan(0.0015);
		expect(Math.abs(v[1] - v[3])).toBeLessThan(0.0015);
		expect(Number(sum(v).toFixed(10))).toBe(1);
	});
	it('Normal near an edge does not inflate the end outcome with the open tail', () => {
		const v = ok(getDefinitionProbabilities({ type: 'Normal', centre: 1, sd: 0.1 }, none(4)));
		expect(v[3]).toBeGreaterThan(0.95);
		expect(v[0]).toBe(0);
		expect(Number(sum(v).toFixed(10))).toBe(1);
	});
	it('maps values through the scale order', () => {
		// Column order High, Low, Medium; scale order Low, Medium, High
		const order = [1, 2, 0];
		const v = ok(
			getDefinitionProbabilities({ type: 'Expression', expression: 'x' }, none(3), order),
		);
		expect(v).toEqual([0.5, 0.167, 0.333]);
	});
	it('Uniform over [0.5, n+0.5] splits equally', () => {
		const v = ok(getDefinitionProbabilities({ type: 'Uniform', min: 0.5, max: 4.5 }, none(4)));
		expect(v).toEqual([0.25, 0.25, 0.25, 0.25]);
	});
	it('Uniform assigns outside mass to nothing but normalises', () => {
		const v = ok(getDefinitionProbabilities({ type: 'Uniform', min: 1.5, max: 3.5 }, none(4)));
		expect(v).toEqual([0, 0.5, 0.5, 0]);
	});
	it('Triangular is symmetric and peaks at the mode', () => {
		const v = ok(
			getDefinitionProbabilities(
				{ type: 'Triangular', min: 0.5, mode: 3, max: 5.5 },
				none(5),
			),
		);
		expect(v[0]).toBe(v[4]);
		expect(v[1]).toBe(v[3]);
		expect(v[2]).toBeGreaterThan(v[1]);
		expect(v[1]).toBeGreaterThan(v[0]);
		expect(Number(sum(v).toFixed(10))).toBe(1);
	});
	it('Triangular matches the analytic CDF', () => {
		const v = ok(
			getDefinitionProbabilities(
				{ type: 'Triangular', min: 0.5, mode: 1.5, max: 2.5 },
				none(2),
			),
		);
		expect(v).toEqual([0.5, 0.5]);
	});
	it('gives disabled outcomes 0 and renormalises the rest', () => {
		const disabled = [false, true, false, false, true];
		const v = ok(
			getDefinitionProbabilities({ type: 'Normal', centre: 0.5, sd: 0.2 }, disabled),
		);
		expect(v[1]).toBe(0);
		expect(v[4]).toBe(0);
		expect(Number(sum(v).toFixed(10))).toBe(1);
		expect(v[2]).toBeGreaterThan(v[0]);
	});
	it('gives the single outcome 1 when n=1', () => {
		expect(
			ok(getDefinitionProbabilities({ type: 'Normal', centre: 0.5, sd: 1 }, [false])),
		).toEqual([1]);
		expect(
			ok(getDefinitionProbabilities({ type: 'Expression', expression: '5' }, [false])),
		).toEqual([1]);
	});
	it('errors on invalid parameters', () => {
		const run = (d: Parameters<typeof getDefinitionProbabilities>[0]) =>
			'error' in getDefinitionProbabilities(d, none(3));
		expect(run({ type: 'Normal', centre: 0.5, sd: 0 })).toBe(true);
		expect(run({ type: 'Normal', centre: NaN, sd: 1 })).toBe(true);
		expect(run({ type: 'Normal', centre: 1.2, sd: 0.1 })).toBe(true);
		expect(run({ type: 'Uniform', min: 3, max: 3 })).toBe(true);
		expect(run({ type: 'Triangular', min: 1, mode: 5, max: 3 })).toBe(true);
	});
	it('errors when all enabled mass is zero', () => {
		const result = getDefinitionProbabilities({ type: 'Uniform', min: 0.5, max: 1.5 }, [
			true,
			false,
			false,
		]);
		expect('error' in result).toBe(true);
	});

	describe('Expression', () => {
		const expr = (expression: string, n = 3, disabled?: boolean[]) =>
			getDefinitionProbabilities({ type: 'Expression', expression }, disabled ?? none(n));

		it('normalises weights', () => {
			expect(ok(expr('x', 4))).toEqual([0.1, 0.2, 0.3, 0.4]);
			expect(ok(expr('1', 4))).toEqual([0.25, 0.25, 0.25, 0.25]);
		});
		it('respects precedence', () => {
			expect(ok(expr('2 + 2 * 3 - 1 + x'))).toEqual([0.296, 0.333, 0.371]);
			expect(ok(expr('1 + 3 * (x - 1)', 2))).toEqual([0.2, 0.8]);
		});
		it('treats ^ as right associative', () => {
			expect(ok(expr('2^3^2 - 512 + x', 2))).toEqual([0.333, 0.667]);
			expect(ok(expr('2^2^3 - 256 + x', 2))).toEqual([0.333, 0.667]);
		});
		it('binds unary minus below ^ and supports negative exponents', () => {
			expect(ok(expr('-2^2 + 4 + x', 2))).toEqual([0.333, 0.667]);
			expect(ok(expr('2^-1 * 2 * x', 2))).toEqual([0.333, 0.667]);
		});
		it('supports functions', () => {
			expect(ok(expr('exp(-x)', 2))).toEqual([0.731, 0.269]);
			expect(ok(expr('sqrt(x * x)', 3))).toEqual([0.167, 0.333, 0.5]);
			expect(ok(expr('abs(0 - x)', 2))).toEqual([0.333, 0.667]);
			expect(ok(expr('ln(e^x)', 2))).toEqual([0.333, 0.667]);
			expect(ok(expr('log(10^x)', 2))).toEqual([0.333, 0.667]);
			expect(ok(expr('pow(x, 2)', 2))).toEqual([0.2, 0.8]);
			expect(ok(expr('min(x, 2)', 3))).toEqual([0.2, 0.4, 0.4]);
			expect(ok(expr('max(x, 2, 0)', 3))).toEqual([0.286, 0.286, 0.428]);
		});
		it('supports n, pi, decimals and is case insensitive', () => {
			expect(ok(expr('N - X + 0.5', 2))).toEqual([0.75, 0.25]);
			expect(ok(expr('PI * x', 2))).toEqual([0.333, 0.667]);
			expect(ok(expr('.5 + 1.5 * (x - 1)', 2))).toEqual([0.2, 0.8]);
		});
		it('gives disabled outcomes 0', () => {
			expect(ok(expr('x', 3, [true, false, false]))).toEqual([0, 0.4, 0.6]);
		});
		it('reports syntax errors', () => {
			const message = (e: string) => {
				const r = expr(e);
				return 'error' in r ? r.error : '';
			};
			expect(message('y')).toBe(quoted('Unknown name', 'y'));
			expect(message('foo(1)')).toBe(quoted('Unknown function', 'foo'));
			expect(message('1 +')).toBe('Unexpected end of expression');
			expect(message('(1 + 2')).toBe('Unexpected end of expression');
			expect(message('1 2')).toBe(quoted('Unexpected', '2'));
			expect(message('2 x')).toBe(quoted('Unexpected', 'x'));
			expect(message('1 + * 2')).toBe(quoted('Unexpected', '*'));
			expect(message('(1))')).toBe(quoted('Unexpected', ')'));
			expect(message('1 $ 2')).toBe(quoted('Unexpected character', '$'));
			expect(message('')).toBe('Enter an expression');
			expect(message('exp(1, 2)')).toContain('exp takes 1 argument');
			expect(message('pow(1)')).toContain('pow takes 2 arguments');
			expect(message('1.2.3')).toBeTruthy();
		});
		it('reports negative and non-finite weights', () => {
			expect('error' in expr('x - 2')).toBe(true);
			expect('error' in expr('1 / (x - 1)')).toBe(true);
			expect('error' in expr('sqrt(0 - x)')).toBe(true);
			expect('error' in expr('0')).toBe(true);
		});
		it('does not evaluate arbitrary code', () => {
			expect('error' in expr('constructor')).toBe(true);
			expect('error' in expr('constructor(1)')).toBe(true);
			expect('error' in expr('toString(1)')).toBe(true);
		});
	});
});

describe('validateDefinition', () => {
	it('accepts valid definitions', () => {
		expect(validateDefinition({ type: 'Manual' }, 3)).toBeUndefined();
		expect(validateDefinition(defaultDefinition('Normal', 4), 4)).toBeUndefined();
		expect(validateDefinition({ type: 'Expression', expression: 'x^2' }, 4)).toBeUndefined();
	});
	it('returns user-facing errors', () => {
		expect(validateDefinition({ type: 'Normal', centre: 0.5, sd: -1 }, 3)).toBeTruthy();
		expect(validateDefinition({ type: 'Expression', expression: 'z' }, 3)).toBe(
			quoted('Unknown name', 'z'),
		);
	});
});

describe('formatDefinition', () => {
	it('formats each type', () => {
		expect(formatDefinition({ type: 'Manual' })).toBe('Manual values');
		expect(formatDefinition({ type: 'Normal', centre: 0.45, sd: 0.2 })).toBe(
			'Normal · centre 0.45 · SD 0.2',
		);
		expect(formatDefinition({ type: 'Normal', centre: 0.5, sd: 0.3333333 })).toBe(
			'Normal · centre 0.5 · SD 0.333',
		);
		expect(formatDefinition({ type: 'Uniform', min: 1, max: 5 })).toBe('Uniform · 1 to 5');
		expect(formatDefinition({ type: 'Triangular', min: 1, mode: 3, max: 5 })).toBe(
			'Triangular · min 1 · most likely 3 · max 5',
		);
		expect(formatDefinition({ type: 'Expression', expression: 'exp(-x)' })).toBe(
			'Expression · f(x) = exp(-x)',
		);
	});
});

describe('defaultDefinition', () => {
	it('builds defaults for n outcomes', () => {
		expect(definitionTypes).toEqual([
			'Manual',
			'Normal',
			'Uniform',
			'Triangular',
			'Expression',
		]);
		expect(defaultDefinition('Manual', 5)).toEqual({ type: 'Manual' });
		expect(defaultDefinition('Normal', 5)).toEqual({ type: 'Normal', centre: 0.5, sd: 0.2 });
		expect(defaultDefinition('Uniform', 5)).toEqual({ type: 'Uniform', min: 0.5, max: 5.5 });
		expect(defaultDefinition('Triangular', 5)).toEqual({
			type: 'Triangular',
			min: 0.5,
			mode: 3,
			max: 5.5,
		});
		expect(defaultDefinition('Expression', 5)).toEqual({
			type: 'Expression',
			expression: 'exp(-x)',
		});
	});
	it('produces valid definitions for every type', () => {
		for (const type of definitionTypes)
			expect(validateDefinition(defaultDefinition(type, 4), 4)).toBeUndefined();
	});
});

describe('definitionsEqual', () => {
	it('compares type and parameters', () => {
		expect(definitionsEqual({ type: 'Manual' }, { type: 'Manual' })).toBe(true);
		expect(
			definitionsEqual(
				{ type: 'Normal', centre: 1, sd: 1 },
				{ type: 'Normal', centre: 1, sd: 1 },
			),
		).toBe(true);
		expect(
			definitionsEqual(
				{ type: 'Normal', centre: 1, sd: 1 },
				{ type: 'Normal', centre: 1, sd: 2 },
			),
		).toBe(false);
		expect(definitionsEqual({ type: 'Uniform', min: 0, max: 1 }, { type: 'Manual' })).toBe(
			false,
		);
		expect(
			definitionsEqual(
				{ type: 'Expression', expression: 'x' },
				{ type: 'Expression', expression: 'x' },
			),
		).toBe(true);
		expect(
			definitionsEqual(
				{ type: 'Triangular', min: 0, mode: 1, max: 2 },
				{ type: 'Triangular', min: 0, mode: 1, max: 3 },
			),
		).toBe(false);
	});
});

describe('migrateDefinition', () => {
	it('converts a positional Normal to the 0–1 scale', () => {
		const legacy = { type: 'Normal', mean: 3, sd: 1 } as unknown as Parameters<
			typeof migrateDefinition
		>[0];
		expect(migrateDefinition(legacy, 5)).toEqual({ type: 'Normal', centre: 0.5, sd: 0.2 });
	});
	it('leaves other definitions alone', () => {
		const normal = { type: 'Normal', centre: 0.3, sd: 0.1 } as const;
		expect(migrateDefinition(normal, 5)).toBe(normal);
	});
});

describe('rebalanceRow (keep rows at 1)', () => {
	it('scales the other cells in proportion', () => {
		expect(rebalanceRow([cell(0.25), cell(0.5), cell(0.25)], 0, 0.4)).toEqual([0.4, 0.4, 0.2]);
	});
	it('never changes locked cells', () => {
		expect(rebalanceRow([cell(0.4), cell(0.4), cell(0.2, true)], 0, 0.6)).toEqual([
			0.6, 0.2, 0.2,
		]);
	});
	it('skips restricted cells', () => {
		expect(rebalanceRow([cell(0.5), cell(0.5), cell(0, false, true)], 0, 0.3)).toEqual([
			0.3, 0.7, 0,
		]);
	});
	it('splits the rest equally when the other cells are 0', () => {
		expect(rebalanceRow([cell(0), cell(0), cell(0)], 1, 0.4)).toEqual([0.3, 0.4, 0.3]);
	});
	it('drops the others to 0 when the typed value is more than what is left', () => {
		expect(rebalanceRow([cell(0.2), cell(0.5), cell(0.3, true)], 0, 0.9)).toEqual([
			0.9, 0, 0.3,
		]);
	});
	it('matches the precision of locked cells', () => {
		const result = rebalanceRow(
			[cell(0.1234, true), cell(0.3), cell(0.3), cell(0.2766)],
			1,
			0.2,
		);
		expect(Number(sum(result).toFixed(10))).toBe(1);
		expect(result[0]).toBe(0.1234);
	});
	it('keeps the row at exactly 1 with more decimals and thirds', () => {
		const result = rebalanceRow([cell(1 / 3), cell(1 / 3), cell(1 / 3)], 0, 0.4567);
		expect(Number(sum(result).toFixed(10))).toBe(1);
		const thirds = rebalanceRow([cell(0.2), cell(0.2), cell(0.2), cell(0.4)], 3, 0);
		expect(Number(sum(thirds).toFixed(10))).toBe(1);
	});
});

describe('resolveScaleOrder', () => {
	it('uses the stored order and appends new outcomes', () => {
		expect(resolveScaleOrder(['a', 'b', 'c', 'd'], ['c', 'a', 'gone'])).toEqual([2, 0, 1, 3]);
	});
	it('defaults to column order', () => {
		expect(resolveScaleOrder(['a', 'b'])).toEqual([0, 1]);
	});
});

describe('fillLastEmpty (default while typing)', () => {
	it('gives the last empty cell the rest', () => {
		expect(fillLastEmpty([cell(0.3), cell(0), cell(0)], 1, 0.4)).toEqual([0.3, 0.4, 0.3]);
	});
	it('fills whichever cell is the last empty one, not only the rightmost', () => {
		expect(fillLastEmpty([cell(0), cell(0.5), cell(0)], 2, 0.2)).toEqual([0.3, 0.5, 0.2]);
	});
	it('waits while more than one cell is empty', () => {
		expect(fillLastEmpty([cell(0), cell(0), cell(0)], 0, 0.3)).toEqual([0.3, 0, 0]);
	});
	it('does nothing when typing in the last empty cell itself', () => {
		expect(fillLastEmpty([cell(0.3), cell(0.4), cell(0)], 2, 0.2)).toEqual([0.3, 0.4, 0.2]);
	});
	it('leaves rows that already sum to 1 alone, so a deliberate 0 stays', () => {
		expect(fillLastEmpty([cell(0.5), cell(0.5), cell(0)], 0, 0.4)).toEqual([0.4, 0.5, 0]);
	});
	it('skips locked and restricted cells', () => {
		expect(
			fillLastEmpty([cell(0.2), cell(0, true), cell(0, false, true), cell(0)], 0, 0.3),
		).toEqual([0.3, 0, 0, 0.7]);
	});
	it('leaves it to the sum warning when the others are already over 1', () => {
		expect(fillLastEmpty([cell(0.8), cell(0), cell(0)], 1, 0.5)).toEqual([0.8, 0.5, 0]);
	});
	it('matches the precision of the typed values', () => {
		expect(fillLastEmpty([cell(0.125), cell(0), cell(0)], 1, 0.3)).toEqual([0.125, 0.3, 0.575]);
	});
});
