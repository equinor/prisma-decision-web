import { DecisionTree } from '../hooks/api/useGetDecisionTree';
import { Edge } from '@xyflow/react';

export const buildDecisionTreeEdge = (
	node: DecisionTree,
	targetId: string,
	stateId: string,
	animated = false,
) => {
	if (node.type === 'End') return;
	const probability = node.probabilities
		? node.probabilities.find(p => p.outcome_id === stateId)?.probability_value || 0
		: 0;

	const utility = node.utilities
		? node.utilities.find(u => u.outcome_id === stateId || u.option_id === stateId)
				?.utility_value || 0
		: 0;

	const newEdge: Edge = {
		id: `e${node.id}-${targetId}`,
		source: node.id,
		target: targetId,
		type: 'decisionTreeEdge',
		zIndex: animated ? 1 : 0,
		animated,
		data: {
			probability,
			utility,
			stateId,
		},
	};
	return newEdge;
};
