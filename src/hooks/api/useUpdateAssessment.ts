import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Assessment } from '../../validators';

export const useUpdateAssessment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (assessment: Assessment) => {
			await apiClient.put('/assessments', [assessment]);
			return assessment;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: ['projects'] }),
				queryClient.refetchQueries({ queryKey: ['assessments'] }),
			]);
		},
	});
};
