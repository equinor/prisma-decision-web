import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useCreateObjectiveOptimistic = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Objective) => {
			const res = await apiClient.post('/objectives', [data]);
			return res.data[0];
		},
		onMutate: (newObjective: Objective) => {
			const projectId = newObjective.project_id;
			queryClient.cancelQueries({ queryKey: ['objectives'] });
			const previousObjectives = queryClient.getQueryData<Objective[]>(['objectives']) || [];
			queryClient.setQueryData(['objectives'], [...previousObjectives, newObjective]);
			return { previousObjectives, projectId };
		},
		onError: (_err, _newObjective, context) => {
			if (context?.previousObjectives) {
				queryClient.setQueryData(['objectives'], context.previousObjectives);
			}
			showErrorToast('Failed to create objective');
		},
		onSuccess: async () => {
			onSuccess?.();
			await queryClient.refetchQueries({ queryKey: ['objectives'] });
		},
	});
};
