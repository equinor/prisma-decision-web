import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { WhiteboardNode } from '../../validators';

const defaultValue: WhiteboardNode[] = [];

export const useGetWhiteboardNodes = () => {
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['whiteboardNodes'],
		queryFn: async () => {
			const res = await apiClient.get<WhiteboardNode[]>('/board_nodes');
			return res.data;
		},
	});

	return {
		nodes: data,
		...rest,
	};
};
