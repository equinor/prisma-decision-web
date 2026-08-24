import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useUpdateObjective = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective: Objective) => {
			await apiClient.put('/objectives', [objective]);
			return objective;
		},
		onMutate: async (updatedObjective: Objective) => {
			await queryClient.cancelQueries({
				queryKey: ['objectives'],
			});

			const previousObjectives = queryClient.getQueryData<Objective[]>(['objectives']);
			const updatedObjectives = previousObjectives?.map(obj =>
				obj.id === updatedObjective.id ? { ...obj, ...updatedObjective } : obj,
			);
			queryClient.setQueryData(['objectives'], updatedObjectives);
			return { previousObjectives };
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['objectives'] });
			onSuccess?.();
		},
		onError: () => {
			showErrorToast('Failed to update objective');
		},
	});
};
