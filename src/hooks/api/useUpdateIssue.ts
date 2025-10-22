import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useUpdateIssue = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issue: Issue) => {
			const res = await apiClient.put('/issues', [issue]);
			return res.data;
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['issues'] });
			queryClient.refetchQueries({ queryKey: ['decisionTree'] });
			onSuccess?.();
		},
	});
};
