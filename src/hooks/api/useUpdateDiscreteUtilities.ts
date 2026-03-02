import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DiscreteUtility } from '../../validators';

export const useUpdateDiscreteUtilities = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (util: DiscreteUtility) => {
			const res = await apiClient.put('/discrete_utilities', [util]);
			return res.data[0];
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['influenceDiagramErrors'] });
			queryClient.invalidateQueries({ queryKey: ['solutionDecisionTree'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
	});
};
