import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { WhiteboardNode } from '../../validators';

export const useUpdateWhiteboardNodes = (args: { onSuccess?: () => void } | void) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (nodes: WhiteboardNode[]) => {
			const res = await apiClient.put('/board_nodes', nodes);
			return res.data;
		},
		onMutate: async newNodes => {
			await queryClient.cancelQueries({ queryKey: ['whiteboardNodes'] });
			const previousNodes = queryClient.getQueryData<WhiteboardNode[]>(['whiteboardNodes']);
			if (previousNodes) {
				queryClient.setQueryData(
					['whiteboardNodes'],
					previousNodes.map(node => newNodes.find(n => n.id === node.id) ?? node),
				);
			}
			return { previousNodes };
		},
		onSuccess: () => {
			args?.onSuccess?.();
		},
		onError: () => {
			queryClient.refetchQueries({ queryKey: ['whiteboardNodes'] });
		},
	});
};
