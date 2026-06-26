import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';
import axios from 'axios';

export const useUpdateProject = () => {
	const queryClient = useQueryClient();
	return useMutation<Project, unknown, Project, { previousProjects?: Project[] }>({
		mutationFn: async (project: Project) => {
			await apiClient.put('/projects', [project]);
			return project;
		},
		onMutate: async updatedProject => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ['projects'] });

			// Snapshot the previous value
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']);

			// Optimistically update the cache
			queryClient.setQueryData(['projects'], (old: Project[] | undefined) => {
				if (!old) return [updatedProject];
				return old.map(p => (p.id === updatedProject.id ? updatedProject : p));
			});

			return { previousProjects };
		},
		onError: (_err, _project, context) => {
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
			if (axios.isAxiosError(_err) && _err.response?.status === 401) {
				showErrorToast(_err.response?.data?.detail);
				return;
			}
			showErrorToast('Failed to update project');
		},
		onSuccess: async () => {
			// Refetch to ensure we have the latest from server
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
