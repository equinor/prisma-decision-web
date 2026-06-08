import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Strategy } from '../../validators';

export const useGetStrategy = (projectId: string) => {
	const { data: strategies } = useQuery({
		queryKey: ['strategies', projectId],
		queryFn: async () => {
			const res = await apiClient.get<Strategy[]>(`/projects/${projectId}/strategies`);
			return res.data;
		},
		meta: {
			errorMessage: 'Failed to fetch strategies',
		},
	});
	return {
		strategies,
	};
};
