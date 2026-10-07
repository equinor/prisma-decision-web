import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { StakeholderMatrix } from '../../validators';

export const useGetStakeholderMatrixes = (projectId: string) => {
	const { data: stakeholderMatrices = [], ...rest } = useQuery({
		queryKey: ['stakeholder-matrixes', projectId],
		queryFn: async () => {
			const response = await apiClient.get<StakeholderMatrix[]>(
				`/projects/${projectId}/stakeholder-matrix`,
			);
			return response.data;
		},
		meta: {
			errorMessage: 'Failed to fetch stakeholders',
		},
	});

	return { stakeholderMatrices, ...rest };
};
