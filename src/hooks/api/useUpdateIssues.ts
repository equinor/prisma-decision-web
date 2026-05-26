import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useUpdateIssues = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issues: Issue[]) => {
			await apiClient.put('/issues', issues);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['issues'] });
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['influenceDiagramErrors'] });
		},
		onError: () => {
			showErrorToast('Failed to update issues');
		},
	});
};

export const useUpdateIssuesOptimistic = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issues: Issue[]) => {
			await apiClient.put('/issues', issues);
		},
		onMutate: issues => {
			queryClient.cancelQueries({ queryKey: ['issues'] });
			const previousIssues = queryClient.getQueryData<Issue[]>(['issues']);
			const newIssues = previousIssues?.map(issue => {
				const updatedIssue = issues.find(i => i.id === issue.id);
				return updatedIssue ? { ...issue, ...updatedIssue } : issue;
			});
			queryClient.setQueryData(['issues'], newIssues);
			return { previousIssues };
		},
		onError: (_err, _issues, context) => {
			queryClient.setQueryData(['issues'], context?.previousIssues);
			showErrorToast('Failed to update issues');
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['influenceDiagramErrors'] });
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
	});
};
