import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';

export const useCreateObjective = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Objective) => {
			const res = await apiClient.post('/objectives', [data]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
			onSuccess?.();
		},
	});
};

export const useCreateObjectiveOptimistic = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Objective) => {
			const res = await apiClient.post('/objectives', [data]);
			return res.data[0];
		},
		onMutate: (newObjective: Objective) => {
			queryClient.cancelQueries({ queryKey: ['objectives'] });
			const previousObjectives = queryClient.getQueryData<Objective[]>(['objectives']) || [];
			const newObjectives = previousObjectives.concat(newObjective);
			queryClient.setQueryData(['objectives'], [...newObjectives]);
			return { previousObjectives };
		},
		onError: (_err, _newOpportunity, context) => {
			if (context?.previousObjectives) {
				queryClient.setQueryData(['objectives'], context.previousObjectives);
			}
			return _err;
		},
		onSuccess: async () => {
			onSuccess?.();
		},
	});
};
