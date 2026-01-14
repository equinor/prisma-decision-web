import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective, Project } from '../../validators';

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
			queryClient.cancelQueries({ queryKey: ['projects'] });
			const projectId = newObjective.project_id;
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const newProjects = previousProjects.map(project => {
				if (project.id === projectId) {
					return {
						...project,
						objectives: [...project.objectives, newObjective],
					};
				}
				return project;
			});
			queryClient.setQueryData(['projects'], newProjects);
			return { previousProjects };
		},
		onError: (_err, _newOpportunity, context) => {
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
			return _err;
		},
		onSuccess: async () => {
			onSuccess?.();
		},
	});
};
