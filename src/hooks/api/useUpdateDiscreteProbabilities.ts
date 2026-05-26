import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DiscreteProbability } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useUpdateDiscreteProbabilities = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (prob: DiscreteProbability) => {
			const res = await apiClient.put('/discrete_probabilities', [prob]);
			return res.data[0];
		},
		onError: () => {
			showErrorToast('Failed to update probabilities');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['influenceDiagramErrors'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
	});
};
