import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { WhiteboardNode } from '../../validators';

export const useCreateWhiteboardNodes = (args: { onSuccess?: () => void } | void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (nodes: WhiteboardNode[]) => {
			const res = await apiClient.post<WhiteboardNode[]>('/board_nodes', nodes);
			return res.data;
		},
		onSuccess: () => {
			args?.onSuccess?.();
		},
		onMutate: async newNodes => {
			await queryClient.cancelQueries({ queryKey: ['whiteboardNodes'] });
			const previousNodes = queryClient.getQueryData<WhiteboardNode[]>(['whiteboardNodes']);
			if (previousNodes) {
				queryClient.setQueryData(['whiteboardNodes'], [...previousNodes, ...newNodes]);
			}
			return { previousNodes };
		},
		onError: (_err, _newNodes, context) => {
			if (context?.previousNodes) {
				queryClient.setQueryData(['whiteboardNodes'], context.previousNodes);
			}
			showErrorToast('Failed to add issues to the whiteboard');
		},
	});
};
