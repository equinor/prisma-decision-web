import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Strategy } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useDeleteStrategy = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (strategy: Strategy) => {
			await apiClient.delete(`/strategies/${strategy.id}`);
			return strategy;
		},
		onMutate: async (deletedStrategy: Strategy) => {
			await queryClient.cancelQueries({ queryKey: ['strategies'] });
			const projectId = deletedStrategy.project_id;
			const previousStrategies = queryClient.getQueryData<Strategy[]>(['strategies']) || [];
			const updatedStrategies = previousStrategies.filter(
				(s: Strategy) => s.project_id === projectId && s.id !== deletedStrategy.id,
			);
			queryClient.setQueryData(['strategies'], updatedStrategies);
			return { previousStrategies };
		},
		onError: (_err, _strategy, context) => {
			showErrorToast('Failed to delete strategy');
			if (context?.previousStrategies) {
				queryClient.setQueryData(['strategies'], context.previousStrategies);
			}
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['strategies'] });
		},
	});
};
