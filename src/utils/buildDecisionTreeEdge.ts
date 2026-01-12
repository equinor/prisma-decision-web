import { DecisionTree } from '../hooks/api/useGetDecisionTree';
import { Edge } from '@xyflow/react';

export const buildDecisionTreeEdge = (
	node: DecisionTree,
	child: DecisionTree,
	index: number,
	animated = false,
) => {
	if (node.tree_node.issue.type === 'EndPoint') return;
	const valueId =
		node.tree_node.issue.type === 'Uncertainty'
			? node.tree_node.issue.uncertainty.outcomes[index].id
			: node.tree_node.issue.decision.options[index].id;
	// Find the correct probability using the outcome name
	const outcomeName =
		node.tree_node.issue.type === 'Uncertainty'
			? node.tree_node.issue.uncertainty.outcomes[index].name
			: node.tree_node.issue.decision.options[index].name;
	const probability = node.tree_node.probabilities
		? node.tree_node.probabilities.find(p => p.outcome_name === outcomeName)
				?.probability_value || 0
		: 0;

	const newEdge: Edge = {
		id: `e${node.tree_node.id}-${child.tree_node.id}`,
		source: node.tree_node.id,
		target: child.tree_node.id,
		type: 'decisionTreeEdge',
		zIndex: animated ? 1 : 0,
		animated,
		data: {
			probability,
			valueId,
		},
	};
	return newEdge;
};
