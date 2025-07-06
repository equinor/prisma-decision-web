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
