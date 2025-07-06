import { Node } from '@xyflow/react';
import { Issue } from '../validators';

export const convertNodesToIssues = (nodes: Node[]): Issue[] => {
	return nodes.map(node => {
		const issue = node.data.issue as Issue;
		return {
			...issue,
			node: {
				...issue.node,
				node_style: {
					...issue.node.node_style,
					x_position: Math.floor(node.position.x),
					y_position: Math.floor(node.position.y),
				},
			},
		};
	});
};
