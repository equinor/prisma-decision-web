import { useMemo } from 'react';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { getDiscreteProbabiltyRows } from '../../../../utils/getDiscreteProbabiltyRows';
import { Issue } from '../../../../validators';
import { useGetProbabilityTables } from '../../../../hooks/api/useGetProbabilityTables';

export const useProbablityTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const childOutcomes = issue.uncertainty.outcomes;
	const { data: probabilityTables } = useGetProbabilityTables();
	const discreteProbabilities =
		probabilityTables.find(pt => pt.issue_id === issue.id)?.discrete_probabilities || [];
	// Build lookup maps for option/outcome names from all issues
	const { lookups, rows, parentRowSpans, parents } = useMemo(
		() => getDiscreteProbabiltyRows(discreteProbabilities, issues),
		[discreteProbabilities, issues],
	);
	return {
		childOutcomes,
		parents,
		parentRowSpans,
		rows,
		lookups,
	};
};
