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
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });

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
