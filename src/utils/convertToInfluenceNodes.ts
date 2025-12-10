import { Node } from '@xyflow/react';
import { Issue } from '../validators';

export const convertToInfluenceNodes = (
	issues: Issue[],
	handleClassName?: string,
): Node<{ issue: Issue }>[] => {
	return issues.map(issue => ({
		id: issue.node.id,
		type: 'issue',
		height: 150,
		width: 250,
		position: {
			x: issue.node.node_style.x_position,
			y: issue.node.node_style.y_position,
		},
		data: {
			issue,
			handleClassName: handleClassName || 'bg-primary-resting! z-1 h-3! w-3!', // Add this
		},
	}));
};
