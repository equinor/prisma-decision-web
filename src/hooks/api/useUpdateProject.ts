import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';

export const useUpdateProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (project: Project) => {
			console.log(project);

			// await apiClient.put('/projects', [project]);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
