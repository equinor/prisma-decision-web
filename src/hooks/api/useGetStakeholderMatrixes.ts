import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { StakeholderMatrix } from '../../validators';

const defaultValue: StakeholderMatrix[] = [];

export const useGetStakeholderMatrixes = () => {
	const query = useQuery({
		queryKey: ['stakeholderMatrixes'],
		queryFn: async () => {
			const response = await apiClient.get<StakeholderMatrix[]>('/stakeholder-matrix-entry');
			return response.data;
		},
		meta: {
			errorMessage: 'Failed to fetch stakeholders',
		},
	});

	return { ...query, data: query.data ?? defaultValue };
};
