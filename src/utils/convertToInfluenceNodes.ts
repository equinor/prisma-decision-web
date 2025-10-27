import { Node } from '@xyflow/react';
import { Issue } from '../validators';

export const convertToInfluenceNodes = (issues: Issue[]): Node<{ issue: Issue }>[] => {
	return issues.map(issue => ({
		id: issue.node.id,
		type: 'issue',
		position: {
			x: issue.node.node_style.x_position,
			y: issue.node.node_style.y_position,
		},
		data: {
			issue,
		},
	}));
};
