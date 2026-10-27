import { useMemo } from 'react';
import { useSelectedProjectEdges } from '../../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { useSelectedProjectRestrictionTables } from '../../../../hooks/useSelectedProjectRestrictionTables';
import { getRestrictedEntriesForTargetNode } from '../../../../utils/getProbabilityRestrictions';
import { sortByCreatedAt } from '../../../../utils/sortByCreatedAt';
import { Issue } from '../../../../validators';
import { useGetProbabilityTables } from '../../../../hooks/api/useGetProbabilityTables';
import { getDiscreteValueRows } from '../DiscreteValueTable/getDiscreteValueRows';

export const useProbablityTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const { edges } = useSelectedProjectEdges();
	const { restrictionTables } = useSelectedProjectRestrictionTables();
	const childOutcomes = sortByCreatedAt(issue.uncertainty.outcomes);
	const { data: probabilityTables } = useGetProbabilityTables();
	const discreteProbabilities =
		probabilityTables.find(pt => pt.issue_id === issue.id)?.discrete_probabilities || [];
	const restrictedEntries = useMemo(
		() => getRestrictedEntriesForTargetNode(issue.node.id, edges, restrictionTables),
		[edges, issue.node.id, restrictionTables],
	);

	return {
		childOutcomes,
		restrictedEntries,
		...getDiscreteValueRows(discreteProbabilities, issues),
	};
};
