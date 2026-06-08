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
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
		onError: () => {
			showErrorToast('Failed to update strategy');
		},
	});
};
