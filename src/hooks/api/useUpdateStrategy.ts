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

			const previousStrategies = queryClient.getQueryData<Strategy[]>([
				'strategies',
				updatedStrategy.project_id,
			]);
			if (previousStrategies) {
				queryClient.setQueryData<Strategy[]>(
					['strategies', updatedStrategy.project_id],
					prev =>
						prev
							? prev.map(s => (s.id === updatedStrategy.id ? updatedStrategy : s))
							: [updatedStrategy],
				);
			}
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
		onError: () => {
			showErrorToast('Failed to update strategy');
		},
	});
};
