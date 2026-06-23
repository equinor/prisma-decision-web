import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Strategy } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useUpdateStrategy = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (strategy: Strategy) => {
			await apiClient.put('/strategies', [strategy]);
		},
		onMutate: async (updatedStrategy: Strategy) => {
			await queryClient.cancelQueries({
				queryKey: ['strategies', updatedStrategy.project_id],
			});

			const previousStrategies = queryClient.getQueryData<Strategy[]>(['strategies']) || [];
			const updatedStrategies = previousStrategies.map(strategy =>
				strategy.id === updatedStrategy.id ? updatedStrategy : strategy,
			);
			queryClient.setQueryData(['strategies'], updatedStrategies);
			return { previousStrategies };
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
		onError: (_err, _updatedEntry, context) => {
			showErrorToast('Failed to update strategy');
			const previousStrategies = context?.previousStrategies;
			if (previousStrategies) {
				queryClient.setQueryData(['strategies'], previousStrategies);
			}
			queryClient.invalidateQueries({ queryKey: ['strategies'] });
		},
	});
};
