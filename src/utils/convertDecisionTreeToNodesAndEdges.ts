import { DecisionTree } from '../hooks/api/useGetDecisionTree';
import { buildDecisionTreeEdge } from './buildDecisionTreeEdge';
import { convertToDecisionTreeNode } from './convertToDecisionTreeNode';
import { convertToOutputNode } from './convertToOutputNode';
import { Node, Edge } from '@xyflow/react';

export const convertDecisionTreeToNodesAndEdges = (
	tree: DecisionTree,
	expanded: Set<string>,
	selected: Set<string>,
	depth = 0,
) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	const walk = (node: DecisionTree, depth = 0, path: Set<string> = new Set<string>()) => {
		const issue = node.tree_node.issue;
		const nodeId = node.tree_node.id;
		const isEndPoint = issue.type === 'EndPoint';
		const isCollapsed = !expanded.has(node.tree_node.id) && depth !== 0 && !isEndPoint;

		if (isEndPoint) {
			const newNode = convertToOutputNode(node.tree_node.id, path);
			return nodes.push(newNode);
		}
		if (isCollapsed) {
			const newNode = convertToDecisionTreeNode(issue, 'expandNode', nodeId, path);
			return nodes.push(newNode);
		}
		const newNode = convertToDecisionTreeNode(issue, 'treeNode', nodeId, path);
		nodes.push(newNode);

		if (!node.children) return;
		node.children.forEach((child, index) => {
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
