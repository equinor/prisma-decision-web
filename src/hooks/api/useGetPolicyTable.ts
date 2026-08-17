import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { PolicyTableDecisionOutgoingDto } from '../../validators';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';

export const useGetPolicyTable = (projectId: string) => {
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { data = [], ...rest } = useQuery({
		queryKey: ['policyTable', projectId],
		queryFn: async () => {
			const res = await apiClient.post<PolicyTableDecisionOutgoingDto[]>(
				`solvers/project/${projectId}/policy_table`,
			);
			return res.data;
		},
		enabled: !!projectId && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch policy table',
		},
	});

	return {
		policyTable: data,
		...rest,
	};
};
