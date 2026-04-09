import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DecisionQualityAssessment } from '../../validators';

export const useCreateDecisionQualityAssessment = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: DecisionQualityAssessment) => {
			const res = await apiClient.post('/dqassessments', [data]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['assessments'] });
			onSuccess?.();
		},
	});
};
