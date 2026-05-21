import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Strategy } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useCreateStrategy = (onSuccess?: () => void) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Strategy) => {
			const res = await apiClient.post('/strategies', [data]);
			return res.data[0];
		},
		onSuccess: async () => {
			onSuccess?.();
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
		onError: () => {
			showErrorToast('Failed to create strategy');
		},
	});
};
