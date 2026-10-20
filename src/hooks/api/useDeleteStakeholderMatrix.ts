import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import type { StakeholderMatrixEntry } from '../../validators';

export const useDeleteStakeholderMatrix = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (stakeholder: StakeholderMatrixEntry) => {
			await apiClient.delete(
				`/stakeholder-matrix-entry/${stakeholder.stakeholder_matrix_id}`,
			);
			return stakeholder;
		},
		onMutate: async stakeholder => {
			await queryClient.cancelQueries({
				queryKey: ['stakeholderMatrixes'],
			});
			const previousStakeholders =
				queryClient.getQueryData<StakeholderMatrixEntry[]>(['stakeholderMatrixes']) ?? [];
			queryClient.setQueryData(
				['stakeholderMatrixes'],
				previousStakeholders.filter(
					current => current.stakeholder_matrix_id !== stakeholder.stakeholder_matrix_id,
				),
			);
			return { previousStakeholders };
		},
		onError: (_error, _stakeholder, context) => {
			queryClient.setQueryData(['stakeholderMatrixes'], context?.previousStakeholders);
			showErrorToast('Failed to delete stakeholder');
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({
				queryKey: ['stakeholderMatrixes'],
			});
		},
	});
};
