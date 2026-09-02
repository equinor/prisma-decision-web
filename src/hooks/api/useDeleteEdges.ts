import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { Edge } from '../../validators';

export const useDeleteEdges = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ids: string[]) => {
			if (ids.length === 0) return;
			const params = new URLSearchParams();
			ids.forEach(id => params.append('ids', id));
			await apiClient.delete(`/edges?${params.toString()}`);
		},
		onMutate: async (deletedIds: string[]) => {
			await queryClient.cancelQueries({ queryKey: ['edges'] });
			const previousEdges = queryClient.getQueryData<Edge[]>(['edges']) || [];
			const deletedIdSet = new Set(deletedIds);
			queryClient.setQueryData(
				['edges'],
				previousEdges.filter(edge => !deletedIdSet.has(edge.id)),
			);
			return { previousEdges };
		},
		onSuccess: (_data, ids) => {
			if (ids.length === 0) return;
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['utilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
		onError: (_err, _deletedIds, context) => {
			showErrorToast('Failed to delete edges');
			if (context?.previousEdges) {
				queryClient.setQueryData(['edges'], context.previousEdges);
			}
		},
	});
};
