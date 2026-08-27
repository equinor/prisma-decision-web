import { useGetPolicyTable } from '../../../../hooks/api/useGetPolicyTable';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue, PolicyTableWithParentOptionOutcome } from '../../../../validators';
import {
	getDiscreteValueRows,
	getParentStateLookups,
	ParentStateLookups,
} from '../DiscreteValueTable/getDiscreteValueRows';
import { ParentStateValue } from '../ProbabilityTable/utils';

export type PolicyValue = PolicyTableWithParentOptionOutcome & ParentStateValue;

const findDecisionRows = (
	policyTable: PolicyTableWithParentOptionOutcome[],
	decisionId: string,
	optionIds: Set<string>,
) => {
	const directMatches = policyTable.filter(row => row.decision_id === decisionId);
	if (directMatches.length) return directMatches;

	return policyTable.filter(
		row => optionIds.has(row.option_id) || row.parent_state_ids.some(id => optionIds.has(id)),
	);
};

const toDiscreteValues = (
	rows: PolicyTableWithParentOptionOutcome[],
	selectedIssueId: string,
	lookups: ParentStateLookups,
): PolicyValue[] =>
	rows.map(row => ({
		...row,
		parent_option_ids: row.parent_option_ids.filter(
			optionId => lookups.optionMap.get(optionId)?.issueId !== selectedIssueId,
		),
		parent_outcome_ids: row.parent_state_ids.filter(outcomeId =>
			lookups.outcomeMap.has(outcomeId),
		),
	}));

export const usePolicyTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const { policyTable, isFetching } = useGetPolicyTable();
	const optionIds = new Set(issue.decision.options.map(option => option.id));
	const lookups = getParentStateLookups(issues);
	const decisionRows = findDecisionRows(policyTable, issue.id, optionIds);
	const values = toDiscreteValues(decisionRows, issue.id, lookups);

	return {
		isFetching,
		...getDiscreteValueRows(values, issues),
	};
};
