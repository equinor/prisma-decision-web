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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
		},
	});
};

export const useBulkUpdateDiscreteProbabilities = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (probabilities: DiscreteProbability[]) => {
			const res = await apiClient.put('/discrete_probabilities', probabilities);
			return res.data;
		},

		onError: () => {
			showErrorToast('Failed to update probabilities');
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
		},
	});
};
