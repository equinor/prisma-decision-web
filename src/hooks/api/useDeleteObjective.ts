import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';

export const useDeleteObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective: Objective) => {
			await apiClient.delete(`/objectives/${objective.id}`);
			return objective;
		},
		onMutate: (deletedObjective: Objective) => {
			queryClient.cancelQueries({ queryKey: ['objectives'] });
			const previousObjectives = queryClient.getQueryData<Objective[]>(['objectives']) || [];
			const newObjectives = previousObjectives.filter(
				objective => objective.id !== deletedObjective.id,
			);
			queryClient.setQueryData(['objectives'], newObjectives);
			return { previousObjectives };
		},
		onError: (_err, _deletedObjective, context) => {
			if (context?.previousObjectives) {
				queryClient.setQueryData(['objectives'], context.previousObjectives);
			}
		},
	});
};
