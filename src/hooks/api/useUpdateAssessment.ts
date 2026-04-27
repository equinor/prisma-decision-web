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
		onMutate: (updatedAssessment: Assessment) => {
			queryClient.cancelQueries({ queryKey: ['assessments'] });
			const previousAssessments =
				queryClient.getQueryData<Assessment[]>(['assessments']) || [];
			const updatedAssessments = previousAssessments.map(a =>
				a.id === updatedAssessment.id ? updatedAssessment : a,
			);
			queryClient.setQueryData(['assessments'], updatedAssessments);
			return { previousAssessments };
		},
		onSuccess: async () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
			queryClient.refetchQueries({ queryKey: ['assessments'] });
		},
		onError: (_err, _updatedAssessment, context) => {
			if (context?.previousAssessments) {
				queryClient.setQueryData(['assessments'], context.previousAssessments);
			}
		},
	});
};
