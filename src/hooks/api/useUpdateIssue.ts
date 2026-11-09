import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';
import { issueMutationScope } from './useUpdateIssues';

export const useUpdateIssue = ({ onSuccess }: { onSuccess?: () => void | Promise<void> }) => {
	const queryClient = useQueryClient();
	return useMutation({
		scope: issueMutationScope,
		mutationFn: async (issue: Issue | (() => Issue)) => {
			const updated = typeof issue === 'function' ? issue() : issue;
			const res = await apiClient.put('/issues', [updated]);
			return res.data;
		},
		onSuccess: async () => {
			queryClient.refetchQueries({ queryKey: ['issues'] });
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['utilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
			queryClient.invalidateQueries({ queryKey: ['restrictionTables'] });
			await onSuccess?.();
		},
		onError: () => {
			showErrorToast('Failed to update issue');
		},
	});
};
