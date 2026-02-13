import { Edge, Node } from '@xyflow/react';
import { DecisionTree } from '../hooks/api/useGetDecisionTree';
import { buildSolutionTreeEdge } from './buildSolutionTreeEdge';
import { convertToDecisionTreeNode } from './convertToDecisionTreeNode';
import { convertToOutputNode } from './convertToOutputNode';

export const convertSolutionTreeToNodesAndEdges = ({
	selected,
	tree,
}: ConvertSolutionTreeToNodesAndEdgesArgs) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	const walk = (node: DecisionTree, path: Set<string> = new Set<string>()) => {
		const issue = node.tree_node.issue;
		const nodeId = node.tree_node.id;
		const expectedValue = node.tree_node.expected_value;
		const isEndPoint = issue.type === 'EndPoint';

		if (isEndPoint) {
			const newNode = convertToOutputNode(issue, node.tree_node.id, path);
			return nodes.push(newNode);
		}

		const newNode = convertToDecisionTreeNode(issue, 'treeNode', nodeId, path, expectedValue);
		nodes.push(newNode);

		if (!node.tree_node.children) return;
		node.tree_node.children.forEach((child, index) => {
			const isSelected = selected.has(child.tree_node.id);
			const newEdge = buildSolutionTreeEdge(node, child, index, isSelected);
			if (!newEdge) return;
			edges.push(newEdge);
			walk(child, new Set([...path, child.tree_node.id]));
		});
	};
	walk(tree);
	return { nodes, edges };
};

type ConvertSolutionTreeToNodesAndEdgesArgs = {
	tree: DecisionTree;
	selected: Set<string>;
};
