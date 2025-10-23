import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';

export const useUpdateObjective = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective: Objective) => {
			await apiClient.put('/objectives', [objective]);
			return objective;
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
			onSuccess?.();
		},
	});
};
