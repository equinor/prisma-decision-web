import { Issue } from '../validators';

export const convertToCompactTreeNode = (issues: Issue[]) => {
	return issues.map((issue, index) => ({
		id: issue?.id,
		type: 'treeNode',
		height: 80,
		width: 250,
		position: {
			x: index * 500,
			y: 100,
		},
		data: {
			issueId: issue.id,
			issue: issue,
		},
	}));
};
