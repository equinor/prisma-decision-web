import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { InfluenceNode } from '../../validators';

const defaultValue: InfluenceNode[] = [];

export const useGetInfluenceNodes = () => {
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['nodes'],

		queryFn: async () => {
			const res = await apiClient.get<InfluenceNode[]>('/nodes');
			return res.data;
		},
	});

	return {
		nodes: data,
		...rest,
	};
};
