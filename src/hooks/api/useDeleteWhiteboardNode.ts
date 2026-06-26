import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { WhiteboardNode } from '../../validators';

export const useDeleteWhiteboardNode = (args: { onSuccess?: () => void } | void) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ids: string[]) => {
			const res = await apiClient.delete(
				`/board_nodes?${ids.map(id => `ids=${id}`).join('&')}`,
			);
			return res.data[0];
		},
		onSuccess: async () => {
			args?.onSuccess?.();
		},
		onMutate: async newIds => {
			await queryClient.cancelQueries({ queryKey: ['whiteboardNodes'] });
			const previousNodes = queryClient.getQueryData<WhiteboardNode[]>(['whiteboardNodes']);
			if (previousNodes) {
				queryClient.setQueryData(
					['whiteboardNodes'],
					previousNodes.filter(node => !newIds.includes(node.id)),
				);
			}
			return { previousNodes };
		},
		onError: (_err, _newIds, context) => {
			if (context?.previousNodes) {
				queryClient.setQueryData(['whiteboardNodes'], context.previousNodes);
			}
		},
	});
};
