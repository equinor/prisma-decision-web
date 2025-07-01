import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useCreateIssue = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issue: Issue) => {
			const res = await apiClient.post('/issues', [issue]);
			return res.data[0];
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
