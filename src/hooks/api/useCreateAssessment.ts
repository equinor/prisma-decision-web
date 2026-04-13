import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Assessment } from '../../validators';

export const useCreateAssessment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Assessment) => {
			const res = await apiClient.post('/assessments', [data]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['assessments'] });
		},
	});
};
