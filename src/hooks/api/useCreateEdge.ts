import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Edge } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useCreateEdge = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (edge: Edge) => {
			const res = await apiClient.post('/edges', [edge]);
			return res.data[0];
		},
		onMutate: (newEdge: Edge) => {
			queryClient.cancelQueries({ queryKey: ['edges'] });
			const previousEdges = queryClient.getQueryData<Edge[]>(['edges']) || [];
			queryClient.setQueryData(['edges'], [...previousEdges, newEdge]);
			return { previousEdges };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['utilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
		onError: (_err, _newEdge, context) => {
			if (context?.previousEdges) {
				queryClient.setQueryData(['edges'], context.previousEdges);
			}
			showErrorToast('Failed to create edge');
		},
	});
};
