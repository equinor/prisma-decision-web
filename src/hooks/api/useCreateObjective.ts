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
			queryClient.cancelQueries({ queryKey: ['objectives', projectId] });
			const previousObjectives =
				queryClient.getQueryData<Objective[]>(['objectives', projectId]) || [];
			queryClient.setQueryData(
				['objectives', projectId],
				[...previousObjectives, newObjective],
			);
			return { previousObjectives, projectId };
		},
		onError: (_err, _newObjective, context) => {
			if (context?.previousObjectives) {
				queryClient.setQueryData(
					['objectives', context.projectId],
					context.previousObjectives,
				);
			}
			showErrorToast('Failed to create objective');
			return _err;
		},
		onSuccess: async () => {
			onSuccess?.();
		},
	});
};
