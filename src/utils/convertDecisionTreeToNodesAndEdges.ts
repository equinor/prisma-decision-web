import { DecisionTreeIncomingState } from '../components/common/DecisionTree/types';
import { DecisionPath, DecisionTree } from '../hooks/api/useGetDecisionTree';
import { isDecisionPathSelected } from '../hooks/useExpandedTreeNodes';
import { buildDecisionTreeEdge } from './buildDecisionTreeEdge';
import { convertToDecisionTreeNode } from './convertToDecisionTreeNode';
import { convertToOutputNode } from './convertToOutputNode';
import { Node, Edge } from '@xyflow/react';

export const convertDecisionTreeToNodesAndEdges = ({
	selectedPath,
	tree,
	depth = 0,
}: ConvertDecisionTreeToNodesAndEdgesArgs) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	const walk = (
		node: DecisionTree,
		depth = 0,
		statePath: string[] = [],
		incomingState?: DecisionTreeIncomingState,
	) => {
		const expectedValue = node.expected_value;
		const nodeId = node.id;
		const isEndPoint = node.type === 'End';

		if (isEndPoint) {
			const newNode = convertToOutputNode(
				{
					cumulative_probability: node.cumulative_probability,
					id: node.id,
					value: node.endpoint_value,
				},
				node.id,
				statePath,
				incomingState,
			);
			return nodes.push(newNode);
		}

		const newNode = convertToDecisionTreeNode(
			node.issue_id,
			'treeNode',
			nodeId,
			statePath,
			expectedValue,
			undefined,
			incomingState,
		);
		nodes.push(newNode);

		node.utilities.forEach(utility => {
			const stateId = utility.option_id || utility.outcome_id;
			if (!stateId) return;
			const branchPath = [...statePath, stateId];
			const animated = isDecisionPathSelected(selectedPath, branchPath);
			const probability = node.probabilities?.find(
				probability => probability.outcome_id === stateId,
			)?.probability_value;
			const nextIncomingState: DecisionTreeIncomingState = {
				stateId,
				label:
					utility.name ||
					node.probabilities?.find(probability => probability.outcome_id === stateId)
						?.outcome_name ||
					stateId,
				utility: utility.utility_value,
				...(probability !== undefined ? { probability } : {}),
			};

			const matchingChild = node.children.find(c => c.parent_state_id === stateId);

			if (matchingChild) {
				const newEdge = buildDecisionTreeEdge(node.id, matchingChild.id, animated);
				if (!newEdge) return;
				edges.push(newEdge);
				walk(matchingChild, depth + 1, branchPath, nextIncomingState);
				return;
			}
			const expandNodeId = `expand:${node.id}:${stateId}`;
			const newEdge = buildDecisionTreeEdge(node.id, expandNodeId, animated);
			const expandNode = convertToDecisionTreeNode(
				node.issue_id,
				'expandNode',
				expandNodeId,
				statePath,
				expectedValue,
				stateId,
				nextIncomingState,
			);
			if (!newEdge) return;
			nodes.push(expandNode);
			edges.push(newEdge);
		});
	};
	walk(tree, depth);
	return { nodes, edges };
};

type ConvertDecisionTreeToNodesAndEdgesArgs = {
	tree: DecisionTree;
	selectedPath: DecisionPath | null;
	depth?: number;
	expandable?: boolean;
};
