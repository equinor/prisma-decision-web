import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { SpiderAssessment } from '../../validators';

export const useCreateSpiderAssessment = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: SpiderAssessment) => {
			const res = await apiClient.post('/spiderassessments', [data]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['assessments'] });
			onSuccess?.();
		},
	});
};
