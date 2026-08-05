import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Edge, Issue } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useDeleteIssue = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issueId: string) => {
			await apiClient.delete(`/issues/${issueId}`);
		},
		onMutate: (issueId: string) => {
			queryClient.cancelQueries({ queryKey: ['issues'] });
			const previousIssues = queryClient.getQueryData<Issue[]>(['issues']) || [];
			const previousEdges = queryClient.getQueryData<Edge[]>(['edges']) || [];
			const updatedEdges = previousEdges.filter(
				edge => edge.head_issue_id !== issueId && edge.tail_issue_id !== issueId,
			);
			const updatedIssues = previousIssues.filter(issue => issue.id !== issueId);
			queryClient.setQueryData(['issues'], updatedIssues);
			queryClient.setQueryData(['edges'], updatedEdges);
			return { previousIssues, previousEdges };
		},
		onError: (_err, _issueId, context) => {
			showErrorToast('Failed to delete issue');
			if (context?.previousIssues) {
				queryClient.setQueryData(['issues'], context.previousIssues);
			}
			if (context?.previousEdges) {
				queryClient.setQueryData(['edges'], context.previousEdges);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['probabilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['utilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
		},
	});
};
