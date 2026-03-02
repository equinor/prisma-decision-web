import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Edge } from '../../validators';

export const useUpdateEdge = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (edge: Edge) => {
			const res = await apiClient.put('/edges', [edge]);
			return res.data[0];
		},
		onMutate: (updatedEdge: Edge) => {
			queryClient.cancelQueries({ queryKey: ['edges'] });
			const previousEdges = queryClient.getQueryData<Edge[]>(['edges']) || [];
			const updatedEdges = previousEdges.map(edge =>
				edge.id === updatedEdge.id ? updatedEdge : edge,
			);
			queryClient.setQueryData(['edges'], updatedEdges);
			return { previousEdges };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['influenceDiagramErrors'] });
			queryClient.invalidateQueries({ queryKey: ['solutionDecisionTree'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
		onError: (_err, _updatedEdge, context) => {
			if (context?.previousEdges) {
				queryClient.setQueryData(['edges'], context.previousEdges);
			}
		},
	});
};
