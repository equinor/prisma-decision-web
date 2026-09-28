import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Edge } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useDeleteEdge = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await apiClient.delete(`/edges/${id}`);
			return res.data;
		},
		onMutate: (deletedId: string) => {
			queryClient.cancelQueries({ queryKey: ['edges'] });
			const previousEdges = queryClient.getQueryData<Edge[]>(['edges']) || [];
			const updatedEdges = previousEdges.filter(edge => edge.id !== deletedId);
			queryClient.setQueryData(['edges'], updatedEdges);
			return { previousEdges };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['utilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
		onError: (_err, _updatedEdge, context) => {
			showErrorToast('Failed to delete edge');
			if (context?.previousEdges) {
				queryClient.setQueryData(['edges'], context.previousEdges);
			}
		},
	});
};

export const useBulkDeleteEdges = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ids: string[]) => {
			const params = new URLSearchParams();
			ids.forEach(id => params.append('ids', id));
			await apiClient.delete(`/edges?${params.toString()}`);
		},
		onMutate: async (ids: string[]) => {
			await queryClient.cancelQueries({ queryKey: ['edges'] });
			const previousEdges = queryClient.getQueryData<Edge[]>(['edges']);
			if (previousEdges) {
				const deletedIds = new Set(ids);
				queryClient.setQueryData(
					['edges'],
					previousEdges.filter(edge => !deletedIds.has(edge.id)),
				);
			}
			return { previousEdges };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['utilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
		onError: (_err, _ids, context) => {
			showErrorToast('Failed to delete edges');
			if (context?.previousEdges) {
				queryClient.setQueryData(['edges'], context.previousEdges);
			}
		},
	});
};
