import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useDeleteIssue = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issueId: string) => {
			await apiClient.delete(`/issues/${issueId}`);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['issues'] });
		},
	});
};

export const useDeleteIssueOptimistic = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issueId: string) => {
			await apiClient.delete(`/issues/${issueId}`);
		},
		onMutate: (issueId: string) => {
			queryClient.cancelQueries({ queryKey: ['issues'] });
			const previousIssues = queryClient.getQueryData<Issue[]>(['issues']) || [];
			const updatedIssues = previousIssues.filter(issue => issue.id !== issueId);
			queryClient.setQueryData(['issues'], updatedIssues);
			return { previousIssues };
		},
		onError: (_err, _issueId, context) => {
			if (context?.previousIssues) {
				queryClient.setQueryData(['issues'], context.previousIssues);
			}
		},
	});
};
