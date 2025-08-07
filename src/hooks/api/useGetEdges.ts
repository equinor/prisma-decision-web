import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Edge } from '../../validators';

export const useGetEdges = () => {
	const { data: edges = [], ...rest } = useQuery({
		queryKey: ['edges'],
		queryFn: async () => {
			const res = await apiClient.get<Edge[]>('/edges');
			return res.data;
		},
	});

	return {
		edges,
		...rest,
	};
};
