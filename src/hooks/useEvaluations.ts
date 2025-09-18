import { useState } from 'react';

export type EvaluationMetric = {
	key: string;
	label: string;
};

export type Evaluation = {
	id: string;
	name: string;
	createdAt: string; // ISO date
	metrics: Record<string, number>; // key -> 0..10
};

// scenarioId -> evaluations[]

const addDemoEvaluation = () => {
	const demo: Evaluation = {
		id: Math.random().toString(36).slice(2),
		name: `Evaluation ${1}`,
		createdAt: new Date().toISOString(),
		metrics: {
			value: Math.floor(Math.random() * 10) + 1,
			risk: Math.floor(Math.random() * 10) + 1,
			cost: Math.floor(Math.random() * 10) + 1,
			feasibility: Math.floor(Math.random() * 10) + 1,
			impact: Math.floor(Math.random() * 10) + 1,
		},
	};
	const demo2: Evaluation = {
		id: Math.random().toString(36).slice(2),
		name: `Evaluation ${2}`,
		createdAt: new Date().toISOString(),
		metrics: {
			value: Math.floor(Math.random() * 10) + 1,
			risk: Math.floor(Math.random() * 10) + 1,
			cost: Math.floor(Math.random() * 10) + 1,
			feasibility: Math.floor(Math.random() * 10) + 1,
			impact: Math.floor(Math.random() * 10) + 1,
		},
	};
	const demo3: Evaluation = {
		id: Math.random().toString(36).slice(2),
		name: `Evaluation ${3}`,
		createdAt: new Date().toISOString(),
		metrics: {
			value: Math.floor(Math.random() * 10) + 1,
			risk: Math.floor(Math.random() * 10) + 1,
			cost: Math.floor(Math.random() * 10) + 1,
			feasibility: Math.floor(Math.random() * 10) + 1,
			impact: Math.floor(Math.random() * 10) + 1,
		},
	};
	const demo4: Evaluation = {
		id: Math.random().toString(36).slice(2),
		name: `Evaluation ${4}`,
		createdAt: new Date().toISOString(),
		metrics: {
			value: Math.floor(Math.random() * 10) + 1,
			risk: Math.floor(Math.random() * 10) + 1,
			cost: Math.floor(Math.random() * 10) + 1,
			feasibility: Math.floor(Math.random() * 10) + 1,
			impact: Math.floor(Math.random() * 10) + 1,
		},
	};
	const demo5: Evaluation = {
		id: Math.random().toString(36).slice(2),
		name: `Evaluation ${5}`,
		createdAt: new Date().toISOString(),
		metrics: {
			value: Math.floor(Math.random() * 10) + 1,
			risk: Math.floor(Math.random() * 10) + 1,
			cost: Math.floor(Math.random() * 10) + 1,
			feasibility: Math.floor(Math.random() * 10) + 1,
			impact: Math.floor(Math.random() * 10) + 1,
		},
	};
	return [demo, demo2, demo3, demo4, demo5];
};

export const DEFAULT_EVALUATION_METRICS: EvaluationMetric[] = [
	{ key: 'value', label: 'Value' },
	{ key: 'risk', label: 'Risk' },
	{ key: 'cost', label: 'Cost' },
	{ key: 'feasibility', label: 'Feasibility' },
	{ key: 'impact', label: 'Impact' },
];

export function useEvaluations() {
	const [evaluations] = useState<Evaluation[]>(addDemoEvaluation());

	return { evaluations, addDemoEvaluation };
}
