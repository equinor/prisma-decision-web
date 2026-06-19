import { ReactFlowInfluenceNode } from '../types';
import { InfluenceNode, Issue } from '../validators';

const getReactFlowNodeType = (issueType?: Issue['type']) => {
	switch (issueType) {
		case 'Decision':
			return 'decision';
		case 'Uncertainty':
			return 'uncertainty';
		case 'Utility':
			return 'utility';
	}
};

export const convertToReactFlowNodes = (
	nodes: InfluenceNode[],
	issues: Issue[],
): ReactFlowInfluenceNode[] => {
	const issueTypeById = new Map(issues.map(issue => [issue.id, issue.type]));

	return nodes.map(node => ({
		id: node.id,
		type: getReactFlowNodeType(issueTypeById.get(node.issue_id)),
		position: {
			x: node.node_style.x_position,
			y: node.node_style.y_position,
		},
		data: {
			...node,
		},
	}));
};
