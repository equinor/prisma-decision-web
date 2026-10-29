import { useMemo } from 'react';
import { useUpdateRestrictionEntries } from '../../../../hooks/api/useUpdateRestrictionEntries';
import { useSelectedProjectEdges } from '../../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectInfluenceNodes } from '../../../../hooks/useSelectedProjectInfluenceNodes';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { useSelectedProjectRestrictionTables } from '../../../../hooks/useSelectedProjectRestrictionTables';
import {
	applyRestrictionEntry,
	TotalRestrictionViolation,
	validateTotalRestriction,
} from '../../../../utils/influenceDiagramValidationUtils';
import { Issue, RestrictionEntry, RestrictionTable } from '../../../../validators';

export type RestrictionToggleContext = {
	entry: RestrictionEntry;
	parentStateName: string;
	childStateName: string;
};

export type RestrictionToggleViolation = {
	message: string;
	/** True when turning this switch off would introduce the violation (switch is locked). */
	blocksToggle: boolean;
};

const formatNames = (names: string[]) => names.map(name => `"${name}"`).join(', ');

const toggledEntry = (entry: RestrictionEntry): RestrictionEntry => ({
	...entry,
	restriction_value: entry.restriction_value === 1 ? 0 : 1,
	updated_at: new Date().toISOString(),
});

export const useRestrictionToggle = (
	restrictionTable: RestrictionTable,
	sourceIssue: Issue,
	targetIssue: Issue,
) => {
	const issues = useSelectedProjectIssues();
	const { nodes } = useSelectedProjectInfluenceNodes();
	const { edges } = useSelectedProjectEdges();
	const { restrictionTables } = useSelectedProjectRestrictionTables();
	const { mutate: updateRestrictionEntry } = useUpdateRestrictionEntries();

	const violationsByEntryId = useMemo(() => {
		const stateNames = new Map(issues.flatMap(getStateNamePairs));
		const issueNames = new Map(issues.map(issue => [issue.id, issue.name]));
		const toMessage = (violation: TotalRestrictionViolation) => {
			const parentState = stateNames.get(violation.parentStateId) ?? 'This state';
			if (violation.rule === 'uncertaintyParent') {
				return `"${parentState}" must allow at least one state: "${targetIssue.name}" is a parent of an uncertainty.`;
			}
			const grandchildren = violation.missingGrandchildIssueIds.map(
				id => issueNames.get(id) ?? 'an issue',
			);
			return `"${parentState}" fully restricts "${targetIssue.name}", but "${sourceIssue.name}" has no edge to ${formatNames(grandchildren)}. Add the edge or allow a state.`;
		};
		const findViolation = (tables: RestrictionTable[], parentStateId: string) =>
			validateTotalRestriction(nodes, issues, edges, tables).violations.find(
				violation =>
					violation.edgeId === restrictionTable.edge_id &&
					violation.parentStateId === parentStateId,
			);

		const map = new Map<string, RestrictionToggleViolation>();
		for (const entry of restrictionTable.restriction_entries) {
			if (entry.restriction_value === 1) {
				// Would turning this switch off introduce a violation for its row?
				const next = findViolation(
					applyRestrictionEntry(restrictionTables, toggledEntry(entry)),
					entry.parent_state_id,
				);
				if (next) map.set(entry.id, { message: toMessage(next), blocksToggle: true });
			} else {
				// Is this row already violating (e.g. the required edge was removed later)?
				const current = findViolation(restrictionTables, entry.parent_state_id);
				if (current) {
					map.set(entry.id, { message: toMessage(current), blocksToggle: false });
				}
			}
		}
		return map;
	}, [
		restrictionTable.edge_id,
		restrictionTable.restriction_entries,
		restrictionTables,
		nodes,
		issues,
		edges,
		sourceIssue.name,
		targetIssue.name,
	]);

	const getViolationForEntry = (entryId: string) => violationsByEntryId.get(entryId);

	const toggleEntry = ({ entry }: RestrictionToggleContext) => {
		if (violationsByEntryId.get(entry.id)?.blocksToggle) return;
		updateRestrictionEntry(toggledEntry(entry));
	};

	return { toggleEntry, getViolationForEntry };
};

const getStateNamePairs = (issue: Issue): [string, string][] => {
	if (issue.type === 'Decision') {
		return issue.decision.options.map(option => [option.id, option.name]);
	}
	if (issue.type === 'Uncertainty') {
		return issue.uncertainty.outcomes.map(outcome => [outcome.id, outcome.name]);
	}
	return [];
};
