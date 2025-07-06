import { Node } from '@xyflow/react';
import { Issue } from '../validators';

export const convertToNodes = (issues: Issue[]): Node[] => {
	return issues.map(issue => ({
		id: issue.id,
		type: 'issue',
		position: {
			x: issue.node.node_style.x_position,
			y: issue.node.node_style.y_position,
		},
		data: {
			label: issue.name,
			issue,
		},
	}));
};
