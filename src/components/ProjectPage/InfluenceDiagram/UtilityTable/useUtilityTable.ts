import { useGetUtilityTables } from '../../../../hooks/api/useGetUtilityTables';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue } from '../../../../validators';
import { getDiscreteValueRows } from '../DiscreteValueTable/getDiscreteValueRows';

export const useUtilityTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const { data } = useGetUtilityTables();
	const discreteUtilities = data.find(pt => pt.issue_id === issue.id)?.discrete_utilities || [];
	return getDiscreteValueRows(discreteUtilities, issues);
};
