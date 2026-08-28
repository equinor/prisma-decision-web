import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useUpdateObjective = (args: { onSuccess?: () => void } | void) => {
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
			args?.onSuccess?.();
		},
		onError: () => {
			showErrorToast('Failed to update objective');
		},
	});
};

export const useUpdateObjectives = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objectives: Objective[]) => {
			await apiClient.put('/objectives', objectives);
			return objectives;
		},
		onMutate: async (objectives: Objective[]) => {
			await queryClient.cancelQueries({
				queryKey: ['objectives'],
			});

			const previousObjectives = queryClient.getQueryData<Objective[]>(['objectives']);
			const updatedObjectives = previousObjectives?.map(
				objective => objectives.find(updated => updated.id === objective.id) ?? objective,
			);
			queryClient.setQueryData(['objectives'], updatedObjectives);
			return { previousObjectives };
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
		onError: (_error, _objectives, context) => {
			queryClient.setQueryData(['objectives'], context?.previousObjectives);
			showErrorToast('Failed to update objectives');
		},
	});
};
