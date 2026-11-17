export const MIXED = 'mixed';
export type SharedValue = number | typeof MIXED;

export const formatProbability = (value: number) => {
	const text = Number(value.toFixed(4)).toString();
	const decimals = text.split('.')[1]?.length ?? 0;
	return decimals >= 2 ? text : value.toFixed(2);
};

export const definitionMenuChoices = [
	{ type: 'Manual', label: 'Manual values' },
	{ type: 'Normal', label: 'Normal' },
	{ type: 'Uniform', label: 'Uniform' },
	{ type: 'Triangular', label: 'Triangular' },
	{ type: 'Expression', label: 'Expression' },
] as const;
export type DefinitionMenuChoice = (typeof definitionMenuChoices)[number]['type'];
