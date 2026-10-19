import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { StakeholderMatrix } from '../../validators';

export const useUpdateStakeholderMatrix = (args?: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (stakeholder: StakeholderMatrix) => {
			await apiClient.put('/stakeholder-matrix-entry', [stakeholder]);
			return stakeholder;
		},
		onMutate: async stakeholder => {
			const queryKey = ['stakeholderMatrixes'];
			await queryClient.cancelQueries({ queryKey });
			const previousStakeholders =
				queryClient.getQueryData<StakeholderMatrix[]>(queryKey) ?? [];
			queryClient.setQueryData(
				queryKey,
				previousStakeholders.map(current =>
					current.stakeholder_matrix_id === stakeholder.stakeholder_matrix_id
						? stakeholder
						: current,
				),
			);
			return { previousStakeholders };
		},
		onError: (_error, _stakeholder, context) => {
			queryClient.setQueryData(['stakeholderMatrixes'], context?.previousStakeholders);
			showErrorToast('Failed to update stakeholder');
		},
		onSuccess: async () => {
			args?.onSuccess?.();
			await queryClient.refetchQueries({
				queryKey: ['stakeholderMatrixes'],
			});
		},
	});
};
