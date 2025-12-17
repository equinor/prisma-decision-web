import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (project: Project) => {
			const res = await apiClient.post<Project[]>('/projects', [project]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
