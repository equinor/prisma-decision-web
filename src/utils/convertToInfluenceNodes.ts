import { InfluenceParentNode } from '../components/ProjectPage/InfluenceDiagram/types';
import { Issue } from '../validators';

export const convertToInfluenceNodes = (issues: Issue[]): InfluenceParentNode[] => {
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
		},
	}));
};
