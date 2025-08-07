import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useUpdateIssues = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issues: Issue[]) => {
			await apiClient.put('/issues', issues);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['issues'] });
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
			queryClient.setQueryData(['issues'], issues);
			return { previousIssues };
		},
		onError: (_err, _issues, context) => {
			queryClient.setQueryData(['issues'], context?.previousIssues);
		},
	});
};
