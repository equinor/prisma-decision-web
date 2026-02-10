import { Issue } from '../validators';
import { Node } from '@xyflow/react';

export const convertToDecisionTreeNode = (
	issue: Issue,
	type: 'treeNode' | 'expandNode',
	id: string,
	path: Set<string> = new Set<string>(),
): Node<{ issue: Issue; path: Set<string> }> => {
	return {
		id,
		type,
		height: 80,
		width: type === 'treeNode' ? 250 : 1,
		position: {
			x: issue.node.node_style.x_position,
			y: issue.node.node_style.y_position,
		},
		data: {
			issue: issue,
			path,
		},
	};
};
