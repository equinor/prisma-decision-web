import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Project } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';
import axios from 'axios';
import { apiClient } from '../../api';

export const useToggleFavorite = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ projectId, favorite }: ToggleFavoriteParams) => {
			return await apiClient.patch(
				`/projects/${projectId}/favorite`,
				{
					favorite,
				},
				{
					headers: { 'Content-Type': 'application/json' },
				},
			);
		},
		onMutate: async ({ projectId, favorite }: ToggleFavoriteParams) => {
			await queryClient.cancelQueries({ queryKey: ['projects'] });
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
			queryClient.setQueryData<Project[]>(['projects'], oldProjects => {
				if (!oldProjects) return [];
				return oldProjects.map(project => {
					if (project.id === projectId) {
						return { ...project, favorite };
					}
					return project;
				});
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
			showErrorToast('Failed to toggle favorite status');
		},
	});
};

type ToggleFavoriteParams = {
	projectId: string;
	favorite: boolean;
};
