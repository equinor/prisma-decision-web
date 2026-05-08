import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { InfluenceNode } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

const defaultValue: InfluenceNode[] = [];

export const useGetInfluenceNodes = () => {
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['nodes'],

		queryFn: async () => {
			try {
				const res = await apiClient.get<InfluenceNode[]>('/nodes');
				return res.data;
			} catch {
				showErrorToast('Failed to fetch influence nodes');
			}
		},
	});

	return {
		nodes: data,
		...rest,
	};
};
