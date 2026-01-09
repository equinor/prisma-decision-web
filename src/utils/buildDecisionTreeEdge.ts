import { DecisionTree } from '../hooks/api/useGetDecisionTree';
import { Edge } from '@xyflow/react';

export const buildDecisionTreeEdge = (
	node: DecisionTree,
	child: DecisionTree,
	index: number,
	animated = false,
) => {
	if (node.tree_node.issue.type === 'EndPoint') return;
	const newEdge: Edge = {
		id: `e${node.tree_node.id}-${child.tree_node.id}`,
		source: node.tree_node.id,
		target: child.tree_node.id,
		type: 'decisionTreeEdge',
		zIndex: animated ? 1 : 0,
		animated,
		data: {
			probability: node.tree_node.probabilities
				? node.tree_node.probabilities.sort((x, y) =>
						x.outcome_name.localeCompare(y.outcome_name),
					)[index].probability_value
				: 0,
			valueId:
				node.tree_node.issue.type === 'Uncertainty'
					? node.tree_node.issue.uncertainty.outcomes.sort((x, y) =>
							x.name.localeCompare(y.name),
						)[index].id
					: node.tree_node.issue.decision.options.sort((x, y) =>
							x.name.localeCompare(y.name),
						)[index].id,
		},
	};
	return newEdge;
};
