import { Issue, IssueType } from '../validators';

export const groupByType = (issues: Issue[]) => {
	return issues.reduce(
		(acc, issue) => {
			acc[issue.type].push(issue);
			return acc;
		},
		{
			Unassigned: [],
			Decision: [],
			Uncertainty: [],
			Value: [],
			Fact: [],
		} as Record<IssueType, Issue[]>,
	);
};
