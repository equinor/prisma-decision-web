import { Issue, IssueType, issueTypes } from '../validators';

export const groupByIssueType = (issues: Issue[]) => {
	const defaultGroupedIssues = issueTypes.reduce(
		(acc, type) => {
			acc[type] = [];
			return acc;
		},
		{} as Record<IssueType, Issue[]>,
	);

	const groupedIssues = issues.reduce((acc, issue) => {
		acc[issue.type].push(issue);
		return acc;
	}, defaultGroupedIssues);
	//sort each group by order
	Object.keys(groupedIssues).forEach(key => {
		groupedIssues[key as IssueType].sort((a, b) => a.order - b.order);
	});
	return groupedIssues;
};
