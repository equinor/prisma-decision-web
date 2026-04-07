import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project, ProjectImportData } from '../../validators';
export const useImportProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (projectImportData: ProjectImportData[]) => {
			const res = await apiClient.post<Project[]>('/projects/import', projectImportData);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
