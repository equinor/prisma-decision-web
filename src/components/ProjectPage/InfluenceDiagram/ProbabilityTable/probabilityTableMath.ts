import { isRowSumValid } from './utils';

export type ProbabilityCell = { value: number; locked: boolean; disabled: boolean };
export type SumFix =
	{ type: 'proportional' } | { type: 'equal' } | { type: 'outcome'; index: number };
export type Definition =
	| { type: 'Manual' }
	// Centre and sd are relative to the outcome scale: 0–1, one equal slice per outcome
	| { type: 'Normal'; centre: number; sd: number }
	| { type: 'Uniform'; min: number; max: number }
	| { type: 'Triangular'; min: number; mode: number; max: number }
	| { type: 'Expression'; expression: string };
export type DefinitionType = Definition['type'];
export type NonManualDefinition = Exclude<Definition, { type: 'Manual' }>;

export const definitionTypes: DefinitionType[] = [
	'Manual',
	'Normal',
	'Uniform',
	'Triangular',
	'Expression',
];

const EPSILON = 1e-7;

export const roundProbabilities = (values: number[], decimals = 3): number[] => {
	if (!values.length) return [];
	const scale = 10 ** decimals;
	const totalUnits = Math.round(values.reduce((sum, v) => sum + v, 0) * scale);
	const scaled = values.map(v => v * scale);
	const floors = scaled.map(v => Math.floor(v + 1e-9));
	let missing = totalUnits - floors.reduce((sum, v) => sum + v, 0);
	const order = scaled
		.map((v, index) => ({ index, remainder: v - Math.floor(v + 1e-9) }))
		.sort((a, b) => (missing >= 0 ? b.remainder - a.remainder : a.remainder - b.remainder));
	for (let i = 0; missing !== 0 && order.length; i = (i + 1) % order.length) {
		const step = missing > 0 ? 1 : -1;
		floors[order[i].index] += step;
		missing -= step;
	}
	return floors.map(v => Number((v / scale).toFixed(decimals)));
};

export const rowSum = (cells: ProbabilityCell[]): number =>
	cells.reduce((sum, cell) => sum + (cell.disabled ? 0 : cell.value), 0);

export const isRowValid = (cells: ProbabilityCell[]): boolean =>
	cells.every(cell => cell.disabled) || isRowSumValid(rowSum(cells));

export const fixProbabilitySum = (
	cells: ProbabilityCell[],
	fix: SumFix,
): { cells: ProbabilityCell[]; error?: string } => {
	if (isRowValid(cells)) return { cells };
	const currentSum = rowSum(cells);
	const editable = cells
		.map((cell, index) => ({ value: cell.value, index }))
		.filter(({ index }) => !cells[index].locked && !cells[index].disabled);
	if (!editable.length) return { cells, error: 'Unlock a cell before fixing this sum.' };
	const lockedSum = cells.reduce(
		(sum, cell) => sum + (cell.locked && !cell.disabled ? cell.value : 0),
		0,
	);
	if (lockedSum > 1 + EPSILON)
		return {
			cells,
			error: 'Locked probabilities exceed 1. Unlock or edit a locked cell first.',
		};

	const values = cells.map(cell => cell.value);
	if (fix.type === 'outcome') {
		const target = editable.find(cell => cell.index === fix.index);
		if (!target) return { cells, error: 'That outcome is locked or restricted.' };
		const value = target.value + 1 - currentSum;
		if (value < -EPSILON || value > 1 + EPSILON)
			return {
				cells,
				error: 'That outcome cannot absorb the discrepancy while staying between 0 and 1.',
			};
		values[target.index] = Math.max(0, Math.min(1, value));
	} else if (fix.type === 'proportional') {
		const target = Math.max(0, 1 - lockedSum);
		const editableSum = editable.reduce((sum, cell) => sum + cell.value, 0);
		editable.forEach(cell => {
			values[cell.index] =
				editableSum > 0 ? (cell.value / editableSum) * target : target / editable.length;
		});
	} else {
		let remaining = 1 - currentSum;
		let active = editable;
		while (active.length && Math.abs(remaining) > 1e-12) {
			const adjustment = remaining / active.length;
			let applied = 0;
			active.forEach(cell => {
				const before = values[cell.index];
				const adjusted = Math.max(0, Math.min(1, before + adjustment));
				values[cell.index] = adjusted;
				applied += adjusted - before;
			});
			remaining -= applied;
			active = active.filter(cell =>
				remaining > 0 ? values[cell.index] < 1 : values[cell.index] > 0,
			);
		}
	}

	const editableIndexes = editable.map(cell => cell.index);
	const rounded = roundProbabilities(editableIndexes.map(index => values[index]));
	editableIndexes.forEach((index, i) => {
		values[index] = rounded[i];
	});
	return { cells: cells.map((cell, index) => ({ ...cell, value: values[index] })) };
};

/** Keep a row at 1 while typing: other unlocked cells absorb the change in proportion. */
export const rebalanceRow = (cells: ProbabilityCell[], index: number, value: number): number[] => {
	const values = cells.map((cell, i) => (i === index ? value : cell.value));
	const others = cells
		.map((cell, i) => ({ cell, i }))
		.filter(({ cell, i }) => i !== index && !cell.locked && !cell.disabled);
	if (!others.length) return values;
	const lockedSum = cells.reduce(
		(sum, cell, i) => sum + (i !== index && cell.locked && !cell.disabled ? cell.value : 0),
		0,
	);
	const target = 1 - value - lockedSum;
	// More than what is left: the others drop to 0 and the sum warning shows
	if (target <= EPSILON) {
		others.forEach(({ i }) => (values[i] = 0));
		return values;
	}
	const othersSum = others.reduce((sum, { cell }) => sum + cell.value, 0);
	const next = others.map(({ cell }) =>
		othersSum > EPSILON ? (cell.value / othersSum) * target : target / others.length,
	);
	// Match the precision of the typed and locked values so the row still sums to exactly 1
	const decimals = (v: number) => Number(v.toFixed(6)).toString().split('.')[1]?.length ?? 0;
	const fixed = [
		value,
		...cells
			.filter((cell, i) => i !== index && cell.locked && !cell.disabled)
			.map(c => c.value),
	];
	const rounded = roundProbabilities(next, Math.max(3, ...fixed.map(decimals)));
	others.forEach(({ i }, k) => (values[i] = rounded[k]));
	return values;
};

/**
 * Scale order: which outcome sits where on the low → high scale used by definitions and
 * Noisy-MAX. Stored ids come first in their saved order; new outcomes are appended.
 * Returns column indexes in scale order.
 */
export const resolveScaleOrder = (outcomeIds: string[], stored: string[] = []): number[] => {
	const known = stored.filter(id => outcomeIds.includes(id));
	const rest = outcomeIds.filter(id => !known.includes(id));
	return [...known, ...rest].map(id => outcomeIds.indexOf(id));
};

export const toScale = <T>(columnValues: T[], order: number[]): T[] =>
	order.map(column => columnValues[column]);

export const fromScale = <T>(scaleValues: T[], order: number[]): T[] => {
	const result = [...scaleValues];
	order.forEach((column, position) => (result[column] = scaleValues[position]));
	return result;
};

type Node =
	| { kind: 'num'; value: number }
	| { kind: 'name'; name: string }
	| { kind: 'unary'; operand: Node }
	| { kind: 'binary'; op: string; left: Node; right: Node }
	| { kind: 'call'; name: string; args: Node[] };

type Token =
	| { kind: 'num'; value: number; text: string }
	| { kind: 'name'; text: string }
	| { kind: 'op'; text: string };

const FUNCTIONS: Record<string, { min: number; max: number; fn: (args: number[]) => number }> = {
	exp: { min: 1, max: 1, fn: ([a]) => Math.exp(a) },
	ln: { min: 1, max: 1, fn: ([a]) => Math.log(a) },
	log: { min: 1, max: 1, fn: ([a]) => Math.log10(a) },
	sqrt: { min: 1, max: 1, fn: ([a]) => Math.sqrt(a) },
	abs: { min: 1, max: 1, fn: ([a]) => Math.abs(a) },
	pow: { min: 2, max: 2, fn: ([a, b]) => Math.pow(a, b) },
	min: { min: 1, max: Infinity, fn: args => Math.min(...args) },
	max: { min: 1, max: Infinity, fn: args => Math.max(...args) },
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };
const VARIABLES = ['x', 'n'];

class ExpressionError extends Error {}

const tokenize = (source: string): Token[] => {
	const tokens: Token[] = [];
	let i = 0;
	while (i < source.length) {
		const char = source[i];
		if (/\s/.test(char)) {
			i++;
		} else if (/[0-9.]/.test(char)) {
			const match = /^(?:\d+\.?\d*|\.\d+)/.exec(source.slice(i));
			if (!match)
				throw new ExpressionError(`Invalid number near '${source.slice(i, i + 3)}'`);
			tokens.push({ kind: 'num', value: Number(match[0]), text: match[0] });
			i += match[0].length;
		} else if (/[a-zA-Z_]/.test(char)) {
			const match = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(source.slice(i));
			const text = (match as RegExpExecArray)[0];
			tokens.push({ kind: 'name', text: text.toLowerCase() });
			i += text.length;
		} else if ('+-*/^(),'.includes(char)) {
			tokens.push({ kind: 'op', text: char });
			i++;
		} else {
			throw new ExpressionError(`Unexpected character '${char}'`);
		}
	}
	return tokens;
};

const describeToken = (token: Token): string => `'${token.text}'`;

const parseExpression = (source: string): Node => {
	const tokens = tokenize(source);
	let position = 0;
	const peek = (): Token | undefined => tokens[position];
	const isOp = (text: string): boolean => {
		const token = peek();
		return token?.kind === 'op' && token.text === text;
	};
	const expectOp = (text: string): void => {
		const token = peek();
		if (!token) throw new ExpressionError('Unexpected end of expression');
		if (token.kind !== 'op' || token.text !== text)
			throw new ExpressionError(`Expected '${text}' but found ${describeToken(token)}`);
		position++;
	};

	const parseSum = (): Node => {
		let left = parseProduct();
		while (isOp('+') || isOp('-')) {
			const op = (tokens[position++] as { text: string }).text;
			left = { kind: 'binary', op, left, right: parseProduct() };
		}
		return left;
	};
	const parseProduct = (): Node => {
		let left = parseUnary();
		while (isOp('*') || isOp('/')) {
			const op = (tokens[position++] as { text: string }).text;
			left = { kind: 'binary', op, left, right: parseUnary() };
		}
		return left;
	};
	const parseUnary = (): Node => {
		if (isOp('-')) {
			position++;
			return { kind: 'unary', operand: parseUnary() };
		}
		if (isOp('+')) {
			position++;
			return parseUnary();
		}
		return parsePower();
	};
	const parsePower = (): Node => {
		const base = parsePrimary();
		if (!isOp('^')) return base;
		position++;
		return { kind: 'binary', op: '^', left: base, right: parseUnary() };
	};
	const parsePrimary = (): Node => {
		const token = peek();
		if (!token) throw new ExpressionError('Unexpected end of expression');
		position++;
		if (token.kind === 'num') return { kind: 'num', value: token.value };
		if (token.kind === 'op') {
			if (token.text !== '(') throw new ExpressionError(`Unexpected '${token.text}'`);
			const inner = parseSum();
			expectOp(')');
			return inner;
		}
		if (isOp('(')) {
			const spec = Object.hasOwn(FUNCTIONS, token.text) ? FUNCTIONS[token.text] : undefined;
			if (!spec) throw new ExpressionError(`Unknown function '${token.text}'`);
			position++;
			const args: Node[] = [parseSum()];
			while (isOp(',')) {
				position++;
				args.push(parseSum());
			}
			expectOp(')');
			if (args.length < spec.min || args.length > spec.max)
				throw new ExpressionError(
					`${token.text} takes ${spec.min === spec.max ? spec.min : `at least ${spec.min}`} argument${spec.min === 1 && spec.max === 1 ? '' : 's'}`,
				);
			return { kind: 'call', name: token.text, args };
		}
		if (!VARIABLES.includes(token.text) && !Object.hasOwn(CONSTANTS, token.text))
			throw new ExpressionError(`Unknown name '${token.text}'`);
		return { kind: 'name', name: token.text };
	};

	if (!tokens.length) throw new ExpressionError('Enter an expression');
	const tree = parseSum();
	const rest = peek();
	if (rest) throw new ExpressionError(`Unexpected ${describeToken(rest)}`);
	return tree;
};

const evaluate = (node: Node, scope: { x: number; n: number }): number => {
	switch (node.kind) {
		case 'num':
			return node.value;
		case 'name':
			return node.name === 'x' ? scope.x : node.name === 'n' ? scope.n : CONSTANTS[node.name];
		case 'unary':
			return -evaluate(node.operand, scope);
		case 'binary': {
			const left = evaluate(node.left, scope);
			const right = evaluate(node.right, scope);
			if (node.op === '+') return left + right;
			if (node.op === '-') return left - right;
			if (node.op === '*') return left * right;
			if (node.op === '/') return left / right;
			return Math.pow(left, right);
		}
		case 'call':
			return FUNCTIONS[node.name].fn(node.args.map(arg => evaluate(arg, scope)));
	}
};

const evaluateWeights = (expression: string, count: number): number[] | string => {
	try {
		const tree = parseExpression(expression);
		const weights = Array.from({ length: count }, (_, i) =>
			evaluate(tree, { x: i + 1, n: count }),
		);
		const bad = weights.findIndex(w => !Number.isFinite(w));
		if (bad >= 0) return `f(${bad + 1}) is not a finite number`;
		const negative = weights.findIndex(w => w < 0);
		if (negative >= 0)
			return `f(${negative + 1}) is negative. Probabilities cannot be negative`;
		return weights;
	} catch (error) {
		if (error instanceof ExpressionError) return error.message;
		throw error;
	}
};

const erf = (x: number): number => {
	if (Number.isNaN(x)) return NaN;
	const abs = Math.abs(x);
	if (abs > 6) return Math.sign(x);
	let term = abs;
	let sum = abs;
	for (let k = 1; k < 500 && term > 1e-17 * sum; k++) {
		term *= (2 * abs * abs) / (2 * k + 1);
		sum += term;
	}
	return Math.sign(x) * ((2 / Math.sqrt(Math.PI)) * Math.exp(-abs * abs) * sum);
};

export const normalCdf = (x: number, mean: number, sd: number): number =>
	0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));

export const normalPdf = (x: number, mean: number, sd: number): number =>
	Math.exp(-0.5 * ((x - mean) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));

const uniformCdf = (x: number, min: number, max: number): number =>
	Math.max(0, Math.min(1, (x - min) / (max - min)));

const triangularCdf = (x: number, min: number, mode: number, max: number): number => {
	if (x <= min) return 0;
	if (x >= max) return 1;
	if (x <= mode) return ((x - min) * (x - min)) / ((max - min) * (mode - min));
	return 1 - ((max - x) * (max - x)) / ((max - min) * (max - mode));
};

const formatNumber = (value: number): string => Number(value.toFixed(3)).toString();

const validateParameters = (definition: Definition): string | undefined => {
	switch (definition.type) {
		case 'Manual':
		case 'Expression':
			return undefined;
		case 'Normal':
			if (!Number.isFinite(definition.centre) || !Number.isFinite(definition.sd))
				return 'Enter a number for centre and standard deviation.';
			if (definition.centre < 0 || definition.centre > 1)
				return 'Centre must be between 0 and 1.';
			if (definition.sd <= 0) return 'Standard deviation must be greater than 0.';
			return undefined;
		case 'Uniform':
			if (!Number.isFinite(definition.min) || !Number.isFinite(definition.max))
				return 'Enter a number for min and max.';
			if (definition.min >= definition.max) return 'Min must be less than max.';
			return undefined;
		case 'Triangular':
			if (
				!Number.isFinite(definition.min) ||
				!Number.isFinite(definition.mode) ||
				!Number.isFinite(definition.max)
			)
				return 'Enter a number for min, mode and max.';
			if (definition.min >= definition.max) return 'Min must be less than max.';
			if (definition.mode < definition.min || definition.mode > definition.max)
				return 'Mode must be between min and max.';
			return undefined;
	}
};

const rawWeights = (definition: NonManualDefinition, count: number): number[] | string => {
	if (definition.type === 'Expression') return evaluateWeights(definition.expression, count);
	// Normal: equal slices on 0–1. Weights outside 0–1 are dropped, which truncates the curve
	if (definition.type === 'Normal')
		return Array.from({ length: count }, (_, i) =>
			Math.max(
				0,
				normalCdf((i + 1) / count, definition.centre, definition.sd) -
					normalCdf(i / count, definition.centre, definition.sd),
			),
		);
	const cdf = (x: number): number => {
		if (x === -Infinity) return 0;
		if (x === Infinity) return 1;
		if (definition.type === 'Uniform') return uniformCdf(x, definition.min, definition.max);
		return triangularCdf(x, definition.min, definition.mode, definition.max);
	};
	return Array.from({ length: count }, (_, i) => {
		const lower = i === 0 ? -Infinity : i + 0.5;
		const upper = i === count - 1 ? Infinity : i + 1.5;
		return Math.max(0, cdf(upper) - cdf(lower));
	});
};

export const getDefinitionProbabilities = (
	definition: NonManualDefinition,
	disabled: boolean[],
	/** Column indexes in scale order (low → high). Defaults to column order. */
	order?: number[],
): { values: number[] } | { error: string } => {
	const parameterError = validateParameters(definition);
	if (parameterError) return { error: parameterError };
	const scaleOrder = order ?? disabled.map((_, i) => i);
	const weights = rawWeights(definition, disabled.length);
	if (typeof weights === 'string') return { error: weights };
	const scaleDisabled = toScale(disabled, scaleOrder);
	const enabledWeights = weights.map((w, i) => (scaleDisabled[i] ? 0 : w));
	const total = enabledWeights.reduce((sum, w) => sum + w, 0);
	if (!(total > 1e-12))
		return { error: 'This definition gives no probability to the available outcomes.' };
	return {
		values: fromScale(roundProbabilities(enabledWeights.map(w => w / total)), scaleOrder),
	};
};

export const validateDefinition = (
	definition: Definition,
	outcomeCount: number,
): string | undefined => {
	if (definition.type === 'Manual') return undefined;
	const result = getDefinitionProbabilities(definition, Array(outcomeCount).fill(false));
	return 'error' in result ? result.error : undefined;
};

export const definitionLabel = (definition: Definition): string => definition.type;

/** Tooltip text: the definition with its settings */
export const formatDefinition = (definition: Definition): string => {
	switch (definition.type) {
		case 'Manual':
			return 'Manual values';
		case 'Normal':
			return `Normal · centre ${formatNumber(definition.centre)} · SD ${formatNumber(definition.sd)}`;
		case 'Uniform':
			return `Uniform · ${formatNumber(definition.min)} to ${formatNumber(definition.max)}`;
		case 'Triangular':
			return `Triangular · min ${formatNumber(definition.min)} · most likely ${formatNumber(definition.mode)} · max ${formatNumber(definition.max)}`;
		case 'Expression':
			return `Expression · f(x) = ${definition.expression}`;
	}
};

/** Normal used to be stored on the 1…n position scale; convert it to the 0–1 scale */
export const migrateDefinition = (definition: Definition, outcomeCount: number): Definition => {
	if (definition.type !== 'Normal' || !('mean' in definition)) return definition;
	const legacy = definition as unknown as { mean: number; sd: number };
	const n = Math.max(outcomeCount, 1);
	return {
		type: 'Normal',
		centre: Math.min(1, Math.max(0, Number(((legacy.mean - 0.5) / n).toFixed(3)))),
		sd: Number((legacy.sd / n).toFixed(3)),
	};
};

export const defaultDefinition = (type: DefinitionType, outcomeCount: number): Definition => {
	const middle = (outcomeCount + 1) / 2;
	switch (type) {
		case 'Manual':
			return { type };
		case 'Normal':
			return { type, centre: 0.5, sd: 0.2 };
		case 'Uniform':
			return { type, min: 0.5, max: outcomeCount + 0.5 };
		case 'Triangular':
			return { type, min: 0.5, mode: middle, max: outcomeCount + 0.5 };
		case 'Expression':
			return { type, expression: 'exp(-x)' };
	}
};

export const definitionsEqual = (a: Definition, b: Definition): boolean => {
	switch (a.type) {
		case 'Manual':
			return b.type === 'Manual';
		case 'Normal':
			return b.type === 'Normal' && a.centre === b.centre && a.sd === b.sd;
		case 'Uniform':
			return b.type === 'Uniform' && a.min === b.min && a.max === b.max;
		case 'Triangular':
			return (
				b.type === 'Triangular' && a.min === b.min && a.mode === b.mode && a.max === b.max
			);
		case 'Expression':
			return b.type === 'Expression' && a.expression === b.expression;
	}
};
