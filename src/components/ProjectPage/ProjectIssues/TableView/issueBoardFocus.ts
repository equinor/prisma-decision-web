import { groupByIssueType } from '../../../../utils/groupByIssueType';
import { DecisionType, decisionTypes, Issue, IssueType } from '../../../../validators';

export const issueBoardFocuses = ['Overview', 'Decisions', 'Uncertainties'] as const;
export type IssueBoardFocus = (typeof issueBoardFocuses)[number];

export const groupIssuesForBoard = (
	focus: IssueBoardFocus,
	issues: Issue[],
): Record<string, Issue[]> => {
	if (focus === 'Overview') return groupByIssueType(issues);
	const byOrder = (a: Issue, b: Issue) => a.order - b.order;
	if (focus === 'Decisions') {
		return Object.fromEntries(
			decisionTypes.map(type => [
				type,
				issues
					.filter(issue => issue.type === 'Decision' && issue.decision.type === type)
					.sort(byOrder),
			]),
		);
	}
	return {
		Key: issues
			.filter(issue => issue.type === 'Uncertainty' && issue.uncertainty.is_key)
			.sort(byOrder),
		'Not key': issues
			.filter(issue => issue.type === 'Uncertainty' && !issue.uncertainty.is_key)
			.sort(byOrder),
	};
};

export const moveIssueToBoardGroup = (
	focus: IssueBoardFocus,
	group: string,
	issue: Issue,
): Issue => {
	if (focus === 'Overview') return { ...issue, type: group as IssueType };
	if (focus === 'Decisions') {
		return {
			...issue,
			type: 'Decision',
			decision: { ...issue.decision, type: group as DecisionType },
		};
	}
	return {
		...issue,
		type: 'Uncertainty',
		uncertainty: { ...issue.uncertainty, is_key: group === 'Key' },
	};
};
