import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DecisionQualityAssessment } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useCreateDecisionQualityAssessment = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: DecisionQualityAssessment) => {
			const res = await apiClient.post('/dq_assessments', [data]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['assessments'] });
			onSuccess?.();
		},
		onError: () => {
			showErrorToast('Failed to create assessment');
		},
	});
};
