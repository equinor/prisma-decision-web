import { DecisionTree } from '../hooks/api/useGetDecisionTree';
import { Edge } from '@xyflow/react';

export const buildSolutionTreeEdge = (
	node: DecisionTree,
	child: DecisionTree,
	index: number,
	animated = false,
) => {
	const nodeType = node.tree_node.issue.type;
	if (nodeType === 'EndPoint') return;

	const outcomeId =
		nodeType === 'Uncertainty'
			? node.tree_node.issue.uncertainty.outcomes[index].id
			: node.tree_node.issue.decision.options[index].id;

	const probability = node.tree_node.probabilities
		? node.tree_node.probabilities.find(p => p.outcome_id === outcomeId)?.probability_value || 0
		: 0;

	const utility = node.tree_node.utilities
		? node.tree_node.utilities.find(
				u => u.outcome_id === outcomeId || u.option_id === outcomeId,
			)?.utility_value || 0
		: 0;

	const outcomeName =
		nodeType === 'Uncertainty'
			? node.tree_node.issue.uncertainty.outcomes.find(o => o.id === outcomeId)?.name
			: node.tree_node.issue.decision.options.find(o => o.id === outcomeId)?.name;

	const newEdge: Edge = {
		id: `e${node.tree_node.id}-${child.tree_node.id}`,
		source: node.tree_node.id,
		target: child.tree_node.id,
		type: 'solutionTreeEdge',
		zIndex: animated ? 1 : 0,
		animated,
		data: {
			probability,
			utility,
			outcomeName,
		},
	};
	return newEdge;
};
