import { DecisionTree } from '../hooks/api/useGetDecisionTree';
import { buildDecisionTreeEdge } from './buildDecisionTreeEdge';
import { convertToDecisionTreeNode } from './convertToDecisionTreeNode';
import { convertToOutputNode } from './convertToOutputNode';
import { Node, Edge } from '@xyflow/react';

export const convertDecisionTreeToNodesAndEdges = ({
	selected,
	tree,
	depth = 0,
	expandable = true,
	expanded,
}: ConvertDecisionTreeToNodesAndEdgesArgs) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	const walk = (node: DecisionTree, depth = 0, path: Set<string> = new Set<string>()) => {
		const issue = node.tree_node.issue;
		const expectedValue = node.tree_node.expected_value;
		const nodeId = node.tree_node.id;
		const isEndPoint = issue.type === 'EndPoint';
		const isCollapsed =
			expandable &&
			expanded &&
			!expanded.has(node.tree_node.id) &&
			depth !== 0 &&
			!isEndPoint;

		if (isEndPoint) {
			const newNode = convertToOutputNode(issue, node.tree_node.id, path);
			return nodes.push(newNode);
		}
		if (isCollapsed) {
			const newNode = convertToDecisionTreeNode(issue, 'expandNode', nodeId, path);
			return nodes.push(newNode);
		}
		const newNode = convertToDecisionTreeNode(issue, 'treeNode', nodeId, path, expectedValue);
		nodes.push(newNode);

		if (!node.tree_node.children) return;
		node.tree_node.children.forEach((child, index) => {
			const isSelected = selected.has(child.tree_node.id);
			const newEdge = buildDecisionTreeEdge(node, child, index, isSelected);
			if (!newEdge) return;
			edges.push(newEdge);
			walk(child, depth + 1, new Set([...path, child.tree_node.id]));
		});
	};
	walk(tree, depth);
	return { nodes, edges };
};

type ConvertDecisionTreeToNodesAndEdgesArgs = {
	tree: DecisionTree;
	expanded?: Set<string>;
	selected: Set<string>;
	depth?: number;
	expandable?: boolean;
};
