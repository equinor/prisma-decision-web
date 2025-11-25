import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DiscreteProbability } from '../../validators';

export const useUpdateDiscreteProbabilities = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (prob: DiscreteProbability) => {
			const res = await apiClient.put('/discrete_probabilities', [prob]);
			return res.data[0];
		},
		onSettled: () => {
			queryClient.refetchQueries({ queryKey: ['decisionTree'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
	});
};
