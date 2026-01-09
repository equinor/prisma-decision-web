import { Issue, IssueType, issueTypes } from '../validators';

export const groupByIssueType = (issues: Issue[]) => {
	const defaultGroupedIssues = issueTypes
		.filter(x => x !== 'Utility')
		.reduce(
			(acc, type) => {
				acc[type] = [];
				return acc;
			},
			{} as Record<Exclude<IssueType, 'Utility'>, Issue[]>,
		);

	const groupedIssues = issues.reduce((acc, issue) => {
		if (issue.type === 'Utility') return acc;
		acc[issue.type].push(issue);
		return acc;
	}, defaultGroupedIssues);
	//sort each group by order
	Object.keys(groupedIssues).forEach(key => {
		groupedIssues[key as Exclude<IssueType, 'Utility'>].sort((a, b) => a.order - b.order);
	});
	return groupedIssues;
};
