import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';

export const useUpdateStrategy = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (project: Project) => {
			await apiClient.put('/projects', [project]);
		},
		onMutate: async (project: Project) => {
			await queryClient.cancelQueries({ queryKey: ['projects'] });
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const updatedProjects = previousProjects.map(p => (p.id === project.id ? project : p));
			queryClient.setQueryData(['projects'], updatedProjects);
			return { previousProjects };
		},
		onError: (_err, _project, context) => {
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
