import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue } from '../../../../validators';
import { useGetProbabilityTables } from '../../../../hooks/api/useGetProbabilityTables';
import { getDiscreteValueRows } from '../DiscreteValueTable/getDiscreteValueRows';

export const useProbablityTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const childOutcomes = issue.uncertainty.outcomes;
	const { data: probabilityTables } = useGetProbabilityTables();
	const discreteProbabilities =
		probabilityTables.find(pt => pt.issue_id === issue.id)?.discrete_probabilities || [];
	return {
		childOutcomes,
		...getDiscreteValueRows(discreteProbabilities, issues),
	};
};
