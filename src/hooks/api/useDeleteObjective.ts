import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useDeleteObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective: Objective) => {
			await apiClient.delete(`/objectives/${objective.id}`);
			return objective;
		},
		onMutate: (deletedObjective: Objective) => {
			const projectId = deletedObjective.project_id;
			queryClient.cancelQueries({ queryKey: ['objectives', projectId] });

			const previousObjectives =
				queryClient.getQueryData<Objective[]>(['objectives', projectId]) || [];
			const newObjectives = previousObjectives.filter(obj => obj.id !== deletedObjective.id);
			queryClient.setQueryData(['objectives', projectId], newObjectives);
			return { previousObjectives, projectId };
		},
		onError: (_err, _deletedObjective, context) => {
			showErrorToast('Failed to delete objective');
			if (context?.previousObjectives) {
				queryClient.setQueryData(
					['objectives', context.projectId],
					context.previousObjectives,
				);
			}
		},
	});
};
