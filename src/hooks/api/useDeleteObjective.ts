import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective, Project } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useDeleteObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective: Objective) => {
			await apiClient.delete(`/objectives/${objective.id}`);
			return objective;
		},
		onMutate: (deletedObjective: Objective) => {
			queryClient.cancelQueries({ queryKey: ['projects'] });
			const projectId = deletedObjective.project_id;
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const newProjects = previousProjects.map(project => {
				if (project.id === projectId) {
					return {
						...project,
						objectives: project.objectives.filter(
							objective => objective.id !== deletedObjective.id,
						),
					};
				}
				return project;
			});
			queryClient.setQueryData(['projects'], newProjects);
			return { previousProjects };
		},
		onError: (_err, _deletedObjective, context) => {
			showErrorToast('Failed to delete objective');
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
		},
	});
};
