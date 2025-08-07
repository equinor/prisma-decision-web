import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';

export const useDeleteProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			await apiClient.delete(`/projects/${id}`);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};

export const useDeleteProjectOptimistic = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			await apiClient.delete(`/projects/${id}`);
		},
		onMutate: (id: string) => {
			queryClient.cancelQueries({ queryKey: ['projects'] });
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const updatedProjects = previousProjects.filter(project => project.id !== id);
			queryClient.setQueryData(['projects'], updatedProjects);
			return { previousProjects };
		},
		onError: (_err, _id, context) => {
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
		},
	});
};
