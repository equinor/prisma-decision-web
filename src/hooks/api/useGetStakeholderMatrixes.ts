import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { StakeholderMatrixEntry } from '../../validators';

const defaultValue: StakeholderMatrixEntry[] = [];

export const useGetStakeholderMatrixes = () => {
	const query = useQuery({
		queryKey: ['stakeholderMatrixes'],
		queryFn: async () => {
			const response = await apiClient.get<StakeholderMatrixEntry[]>(
				'/stakeholder-matrix-entry',
			);
			return response.data;
		},
		meta: {
			errorMessage: 'Failed to fetch stakeholders',
		},
	});

	return { ...query, data: query.data ?? defaultValue };
};
