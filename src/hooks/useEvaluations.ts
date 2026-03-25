export type Evaluation = {
	id: string;
	name: string;
	createdAt: string; // ISO date
	metrics: Record<string, number>; // key -> 0..10
};

export function useEvaluations() {}
