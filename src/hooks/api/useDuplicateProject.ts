import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';
import { showErrorToast, showSuccessToast } from '../../components/ShowToast';
import { useNavigate } from 'react-router';

export const useDuplicateProject = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (id: string): Promise<Project> => {
			const response = await apiClient.post(`/projects/${id}/duplicate`);
			return response.data;
		},
		onSuccess: async data => {
			showSuccessToast('Project duplicated successfully');
			queryClient.refetchQueries({ queryKey: ['issues'] });
			queryClient.refetchQueries({ queryKey: ['nodes'] });
			queryClient.refetchQueries({ queryKey: ['edges'] });
			queryClient.refetchQueries({ queryKey: ['objectives'] });
			queryClient.refetchQueries({ queryKey: ['probabilityTables'] });
			queryClient.refetchQueries({ queryKey: ['utilityTables'] });
			await queryClient.refetchQueries({ queryKey: ['projects'] });
			navigate(`/project/${data.id}`);
		},
		onError: () => {
			showErrorToast('Failed to duplicate project');
		},
	});
};
