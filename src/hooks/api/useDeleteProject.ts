import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';
import { useNavigate } from 'react-router';

export const useDeleteProject = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
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
		onSuccess: () => {
			navigate('/');
		},
		onError: (_err, _id, context) => {
			showErrorToast('Failed to delete project');
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
		},
	});
};
