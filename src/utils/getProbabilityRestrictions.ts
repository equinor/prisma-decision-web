import { Edge, RestrictionEntry, RestrictionTable } from '../validators';

type ParentStateValue = {
	parent_option_ids: string[];
	parent_outcome_ids: string[];
};

export const getRestrictedEntriesForTargetNode = (
	targetNodeId: string,
	edges: Edge[],
	restrictionTables: RestrictionTable[],
): RestrictionEntry[] => {
	const parentEdgeIds = new Set(
		edges.filter(edge => edge.head_id === targetNodeId).map(edge => edge.id),
	);

	return restrictionTables
		.filter(table => parentEdgeIds.has(table.edge_id))
		.flatMap(table => table.restriction_entries)
		.filter(entry => !entry.restriction_value);
};

export const getRestrictedOutcomeIds = (
	parentStates: ParentStateValue,
	outcomeIds: string[],
	restrictedEntries: RestrictionEntry[],
): Set<string> => {
	const parentStateIds = new Set([
		...parentStates.parent_option_ids,
		...parentStates.parent_outcome_ids,
	]);

	return new Set(
		outcomeIds.filter(outcomeId =>
			restrictedEntries.some(
				entry =>
					!entry.restriction_value &&
					entry.child_state_id === outcomeId &&
					parentStateIds.has(entry.parent_state_id),
			),
		),
	);
};
