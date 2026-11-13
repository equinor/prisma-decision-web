import { useGetPolicyTable } from '../../../../hooks/api/useGetPolicyTable';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue } from '../../../../validators';
import { getDiscreteValueRows } from '../ConditionalTable/getDiscreteValueRows';

export const usePolicyTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const { data, isFetching } = useGetPolicyTable();
	const discretePolicies = data.filter(policy => policy.decision_id === issue.id);

	return {
		isFetching,
		...getDiscreteValueRows(discretePolicies, issues),
	};
};
