import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';

export const useGetObjectives = (projectId: string) => {
	const { data = [], ...rest } = useQuery({
		queryKey: ['objectives', projectId],
		queryFn: async () => {
			const res = await apiClient.get<Objective[]>(`/projects/${projectId}/objectives`);
			return res.data;
		},
	});

	return {
		objectives: data,
		...rest,
	};
};
