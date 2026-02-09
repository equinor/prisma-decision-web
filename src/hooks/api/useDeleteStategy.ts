import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Strategy } from '../../validators';

export const useDeleteStrategy = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (strategy: Strategy) => {
			await apiClient.delete(`/strategies/${strategy.id}`);
			return strategy;
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
