import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Scenario } from '../../validators';

export const useCreateScenario = (onSuccess?: (data: Scenario) => void) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (scenario: Scenario) => {
			const res = await apiClient.post<Scenario[]>('/scenarios', [scenario]);
			return res.data[0];
		},
		onSuccess: data => {
			queryClient.refetchQueries({ queryKey: ['scenarios'] });
			onSuccess?.(data);
		},
	});
};
