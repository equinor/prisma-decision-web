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
		meta: {
			errorMessage: 'Failed to fetch edges',
		},
	});

	return {
		edges,
		...rest,
	};
};
