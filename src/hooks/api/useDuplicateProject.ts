import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';

export const useDuplicateProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string): Promise<Project> => {
			const response = await apiClient.post(`/project/${id}/duplicate`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
			queryClient.refetchQueries({ queryKey: ['nodes'] });
			queryClient.refetchQueries({ queryKey: ['edges'] });
		},
	});
};
