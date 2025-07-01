import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (project: Project) => {
			await apiClient.post('/projects', [project]);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
