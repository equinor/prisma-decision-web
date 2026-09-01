import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import useSelectedWhiteboardSheet from '../useSelectedWhiteboardSheet';
import { useSelectedProjectWhiteboardNodes } from '../useSelectedProjectWhiteboardNodes';
import { BOTTOM_LAYER_Z_INDEX, WhiteboardNode } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useCreateWhiteboardNode = (args: { onSuccess?: () => void } | void) => {
	const queryClient = useQueryClient();
	const nodes = useSelectedProjectWhiteboardNodes();
	const sheet = useSelectedWhiteboardSheet();
	const highestZIndex =
		Math.max(
			...nodes
				.filter(node => node.data.board_sheet_id === sheet.id)
				.map(node => node.zIndex ?? BOTTOM_LAYER_Z_INDEX),
			0,
		) + 1;

	return useMutation({
		mutationFn: async (node: WhiteboardNode) => {
			const res = await apiClient.post('/board_nodes', [{ ...node, zIndex: highestZIndex }]);
			return res.data[0];
		},
		onSuccess: async () => {
			args?.onSuccess?.();
		},
		onMutate: async newNode => {
			await queryClient.cancelQueries({ queryKey: ['whiteboardNodes'] });
			const previousNodes = queryClient.getQueryData<WhiteboardNode[]>(['whiteboardNodes']);
			if (previousNodes) {
				queryClient.setQueryData(
					['whiteboardNodes'],
					[...previousNodes, { ...newNode, zIndex: highestZIndex }],
				);
			}
			return { previousNodes };
		},
		onError: (_err, _newNode, context) => {
			if (context?.previousNodes) {
				queryClient.setQueryData(['whiteboardNodes'], context.previousNodes);
			}
			showErrorToast('Failed to add issue to the whiteboard');
		},
	});
};
