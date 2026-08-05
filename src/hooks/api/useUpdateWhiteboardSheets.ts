import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { WhiteboardSheet } from '../../validators';

export const useUpdateWhiteboardSheets = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: WhiteboardSheet) => {
			const res = await apiClient.put<WhiteboardSheet[]>('/board_sheets', [data]);
			return res.data[0];
		},
		onMutate: (newSheet: WhiteboardSheet) => {
			const projectId = newSheet.project_id;
			queryClient.cancelQueries({ queryKey: ['whiteboardSheets'] });
			const previousSheets =
				queryClient.getQueryData<WhiteboardSheet[]>(['whiteboardSheets']) || [];
			queryClient.setQueryData(
				['whiteboardSheets'],
				previousSheets.map(sheet => (sheet.id === newSheet.id ? newSheet : sheet)),
			);
			return { previousSheets, projectId };
		},
		onError: (_err, _newSheet, context) => {
			if (context?.previousSheets) {
				queryClient.setQueryData(['whiteboardSheets'], context.previousSheets);
			}
			showErrorToast('Failed to update whiteboard sheet');
		},
	});
};
