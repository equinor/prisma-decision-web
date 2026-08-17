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
	const walk = (node: DecisionTree, depth = 0, statePath: string[] = []) => {
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
			);
			return nodes.push(newNode);
		}

		const newNode = convertToDecisionTreeNode(
			node.issue_id,
			'treeNode',
			nodeId,
			statePath,
			expectedValue,
		);
		nodes.push(newNode);

		node.utilities.forEach(utility => {
			const stateId = utility.option_id || utility.outcome_id;
			if (!stateId) return;
			const branchPath = [...statePath, stateId];
			const animated = isDecisionPathSelected(selectedPath, branchPath);
			if (utility.pruned) {
				const prunedNodeId = `pruned:${node.id}:${stateId}`;
				const newEdge = buildDecisionTreeEdge(node, prunedNodeId, stateId, animated);
				const prunedNode = convertToDecisionTreeNode(
					node.issue_id,
					'prunedNode',
					prunedNodeId,
					branchPath,
				);
				if (!newEdge) return;
				nodes.push(prunedNode);
				edges.push(newEdge);
				return;
			}

			const matchingChild = node.children.find(c => c.parent_state_id === stateId);

			if (matchingChild) {
				const newEdge = buildDecisionTreeEdge(node, matchingChild.id, stateId, animated);
				if (!newEdge) return;
				edges.push(newEdge);
				walk(matchingChild, depth + 1, branchPath);
				return;
			}
			const expandNodeId = `expand:${node.id}:${stateId}`;
			const newEdge = buildDecisionTreeEdge(node, expandNodeId, stateId, animated);
			const expandNode = convertToDecisionTreeNode(
				node.issue_id,
				'expandNode',
				expandNodeId,
				statePath,
				expectedValue,
				stateId,
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
