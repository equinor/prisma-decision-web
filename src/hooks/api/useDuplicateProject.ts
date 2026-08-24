import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';
import { showErrorToast, showSuccessToast } from '../../components/ShowToast';

export const useDuplicateProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string): Promise<Project> => {
			const response = await apiClient.post(`/projects/${id}/duplicate`);
			return response.data;
		},
		onSuccess: () => {
			showSuccessToast('Project duplicated successfully');
			queryClient.refetchQueries({ queryKey: ['projects'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
			queryClient.refetchQueries({ queryKey: ['nodes'] });
			queryClient.refetchQueries({ queryKey: ['edges'] });
			queryClient.refetchQueries({ queryKey: ['objectives'] });
		},
		onError: () => {
			showErrorToast('Failed to duplicate project');
		},
	});
};
