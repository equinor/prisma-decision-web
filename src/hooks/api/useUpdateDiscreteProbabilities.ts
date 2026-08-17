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
		onMutate: async newProb => {
			await queryClient.cancelQueries({ queryKey: ['discreteProbabilities'] });
			const previousProbs = queryClient.getQueryData<DiscreteProbability[]>([
				'discreteProbabilities',
			]);
			if (previousProbs) {
				queryClient.setQueryData(
					['discreteProbabilities'],
					previousProbs.map(p => (p.id === newProb.id ? newProb : p)),
				);
			}
			return { previousProbs };
		},
		onError: (_err, _newProb, context) => {
			showErrorToast('Failed to update probabilities');
			if (context?.previousProbs) {
				queryClient.setQueryData(['discreteProbabilities'], context.previousProbs);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
		},
	});
};
