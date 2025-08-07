import { Issue, IssueType } from '../validators';

export const groupByType = (issues: Issue[]) => {
	const groupedIssues = issues.reduce(
		(acc, issue) => {
			acc[issue.type].push(issue);
			return acc;
		},
		{
			Unassigned: [],
			Decision: [],
			Uncertainty: [],
			'Value Metric': [],
			Fact: [],
		} as Record<IssueType, Issue[]>,
	);
	//sort each group by order
	Object.keys(groupedIssues).forEach(key => {
		groupedIssues[key as IssueType].sort((a, b) => a.order - b.order);
	});
	return groupedIssues;
};
