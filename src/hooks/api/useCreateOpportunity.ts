import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Opportunity } from '../../validators';

export const useCreateOpportunity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Opportunity) => {
			await apiClient.post('/opportunities', [data]);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
