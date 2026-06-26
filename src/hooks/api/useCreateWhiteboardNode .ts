import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { WhiteboardNode } from '../../validators';

export const useCreateWhiteboardNode = (args: { onSuccess?: () => void } | void) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (node: WhiteboardNode) => {
			const res = await apiClient.post('/board_nodes', [node]);
			return res.data[0];
		},
		onSuccess: async () => {
			args?.onSuccess?.();
		},
		onMutate: async newNode => {
			await queryClient.cancelQueries({ queryKey: ['whiteboardNodes'] });
			const previousNodes = queryClient.getQueryData<WhiteboardNode[]>(['whiteboardNodes']);
			if (previousNodes) {
				queryClient.setQueryData(['whiteboardNodes'], [...previousNodes, newNode]);
			}
			return { previousNodes };
		},
		onError: (_err, _newNode, context) => {
			if (context?.previousNodes) {
				queryClient.setQueryData(['whiteboardNodes'], context.previousNodes);
			}
		},
	});
};
