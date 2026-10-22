import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { decisionTypes, Issue, issueTypes } from '../../../../validators';

export const boardGroupings = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'decisions', label: 'Decisions' },
	{ value: 'uncertainties', label: 'Uncertainties' },
] as const;
export type BoardGrouping = (typeof boardGroupings)[number]['value'];

export type BoardColumn = {
	id: string;
	label: string;
	className: string;
	matches: (issue: Issue) => boolean;
	assign: (issue: Issue) => Issue;
};

// Columns that put the issue in the influence diagram keep the issue type colour.
const outOfDiagramColor = 'bg-background-light';

const uncertaintyKeyColumn = (isKey: boolean): BoardColumn => ({
	id: isKey ? 'Key' : 'Not key',
	label: isKey ? 'Key' : 'Not key',
	className: isKey ? getIssueColumnColor('Uncertainty') : outOfDiagramColor,
	matches: issue => issue.type === 'Uncertainty' && issue.uncertainty.is_key === isKey,
	assign: issue => ({ ...issue, uncertainty: { ...issue.uncertainty, is_key: isKey } }),
});

export const boardColumns: Record<BoardGrouping, BoardColumn[]> = {
	overview: issueTypes
		.filter(type => type !== 'Utility')
		.map(type => ({
			id: type,
			label: type,
			className: getIssueColumnColor(type),
			matches: issue => issue.type === type,
			assign: issue => ({ ...issue, type }),
		})),
	decisions: decisionTypes.map(type => ({
		id: type,
		label: type,
		className: type === 'Focus' ? getIssueColumnColor('Decision') : outOfDiagramColor,
		matches: issue => issue.type === 'Decision' && issue.decision.type === type,
		assign: issue => ({ ...issue, decision: { ...issue.decision, type } }),
	})),
	uncertainties: [uncertaintyKeyColumn(true), uncertaintyKeyColumn(false)],
};
