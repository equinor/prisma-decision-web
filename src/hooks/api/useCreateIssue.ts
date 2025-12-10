import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useCreateIssue = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (issue: Issue) => {
			const res = await apiClient.post('/issues', [issue]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['issues'] });
			await queryClient.refetchQueries({ queryKey: ['nodes'] });
			onSuccess?.();
		},
	});
};
