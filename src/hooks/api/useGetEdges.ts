import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Edge } from '../../validators';

const defaultEdges: Edge[] = [];

export const useGetEdges = () => {
	const { data: edges = defaultEdges, ...rest } = useQuery({
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
