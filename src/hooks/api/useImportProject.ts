import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project, ProjectImportData } from '../../validators';
import { showErrorToast, showSuccessToast } from '../../components/ShowToast';

export const useImportProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (projectImportData: ProjectImportData[]) => {
			const res = await apiClient.post<Project[]>('/projects/import', projectImportData);
			return res.data[0];
		},
		onSuccess: async () => {
			showSuccessToast('Project imported successfully');
			Promise.all([
				queryClient.refetchQueries({ queryKey: ['projects'] }),
				queryClient.refetchQueries({ queryKey: ['issues'] }),
				queryClient.refetchQueries({ queryKey: ['nodes'] }),
				queryClient.refetchQueries({ queryKey: ['edges'] }),
				queryClient.refetchQueries({ queryKey: ['objectives'] }),
				queryClient.refetchQueries({ queryKey: ['strategies'] }),
				queryClient.refetchQueries({ queryKey: ['probabilityTables'] }),
				queryClient.refetchQueries({ queryKey: ['utilityTables'] }),
				queryClient.refetchQueries({ queryKey: ['assessments'] }),
				queryClient.refetchQueries({ queryKey: ['restrictionTables'] }),
				queryClient.refetchQueries({ queryKey: ['whiteboardNodes'] }),
				queryClient.refetchQueries({ queryKey: ['whiteboardSheets'] }),
				queryClient.invalidateQueries({ queryKey: ['influenceDiagramErrors'] }),
			]);
		},
		onError: () => {
			showErrorToast('Failed to import project');
		},
	});
};
