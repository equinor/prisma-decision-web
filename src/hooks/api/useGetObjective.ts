import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';

export const useGetObjective = (projectId: string) => {
	const { data: objectives } = useQuery({
		queryKey: ['objectives', projectId],
		queryFn: async () => {
			const res = await apiClient.get<Objective[]>('/objectives');
			return res.data;
		},
		meta: {
			errorMessage: 'Failed to fetch objectives',
		},
	});
	return {
		objectives,
	};
};
