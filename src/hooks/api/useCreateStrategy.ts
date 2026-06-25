import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Strategy } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useCreateStrategyOptimistic = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Strategy) => {
			const res = await apiClient.post('/strategies', [data]);
			return res.data[0];
		},
		onMutate: (newStrategy: Strategy) => {
			const projectId = newStrategy.project_id;
			queryClient.cancelQueries({ queryKey: ['strategies'] });
			const previousStrategies = queryClient.getQueryData<Strategy[]>(['strategies']) || [];
			queryClient.setQueryData(['strategies'], [...previousStrategies, newStrategy]);
			return { previousStrategies, projectId };
		},
		onError: (_err, _newStrategy, context) => {
			if (context?.previousStrategies) {
				queryClient.setQueryData(['strategies'], context.previousStrategies);
			}
			showErrorToast('Failed to create strategy');
		},
		onSuccess: async () => {
			onSuccess?.();
			await queryClient.refetchQueries({ queryKey: ['strategies'] });
		},
	});
};
