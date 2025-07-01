import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';

export const useCreateObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Objective) => {
			await apiClient.post('/objectives', [data]);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
