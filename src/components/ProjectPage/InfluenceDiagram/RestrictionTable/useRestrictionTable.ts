import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue, RestrictionEntry, RestrictionTable } from '../../../../validators';
import { ParentStateValue } from '../ProbabilityTable/utils';
import { getDiscreteValueRows } from '../DiscreteValueTable/getDiscreteValueRows';
import { getIssueRestrictionStates } from './utils';

export type DiscreteRestrictionEntry = RestrictionEntry & ParentStateValue;

export const useRestrictionTable = (
	restrictionTable: RestrictionTable,
	sourceIssue: Issue,
	targetIssue: Issue,
) => {
	const issues = useSelectedProjectIssues();
	const sourceStates = getIssueRestrictionStates(sourceIssue);
	const targetStates = getIssueRestrictionStates(targetIssue);
	const entries: DiscreteRestrictionEntry[] = restrictionTable.restriction_entries.map(entry => ({
		...entry,
		parent_option_ids: entry.is_parent_uncertainty ? [] : [entry.parent_state_id],
		parent_outcome_ids: entry.is_parent_uncertainty ? [entry.parent_state_id] : [],
	}));

	return {
		...getDiscreteValueRows(entries, issues),
		sourceStates,
		targetStates,
	};
};
