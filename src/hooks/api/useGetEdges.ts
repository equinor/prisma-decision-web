import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Edge } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

const defaultEdges: Edge[] = [];

export const useGetEdges = () => {
	const { data: edges = defaultEdges, ...rest } = useQuery({
		queryKey: ['edges'],
		queryFn: async () => {
			try {
				const res = await apiClient.get<Edge[]>('/edges');
				return res.data;
			} catch {
				showErrorToast('Failed to fetch edges');
			}
		},
	});

	return {
		edges,
		...rest,
	};
};
