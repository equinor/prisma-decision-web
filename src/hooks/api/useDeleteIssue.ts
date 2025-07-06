import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api';

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
