import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { StakeholderMatrix } from '../../validators';

export const useDeleteStakeholderMatrix = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (stakeholder: StakeholderMatrix) => {
			await apiClient.delete(`/stakeholder-matrix/${stakeholder.stakeholder_matrix_id}`);
			return stakeholder;
		},
		onMutate: async stakeholder => {
			await queryClient.cancelQueries({
				queryKey: ['stakeholder-matrixes', stakeholder.project_id],
			});
			const previousStakeholders =
				queryClient.getQueryData<StakeholderMatrix[]>([
					'stakeholder-matrixes',
					stakeholder.project_id,
				]) ?? [];
			queryClient.setQueryData(
				['stakeholder-matrixes', stakeholder.project_id],
				previousStakeholders.filter(
					current => current.stakeholder_matrix_id !== stakeholder.stakeholder_matrix_id,
				),
			);
			return { previousStakeholders };
		},
		onError: (_error, _stakeholder, context) => {
			queryClient.setQueryData(
				['stakeholder-matrixes', context?.previousStakeholders[0]?.project_id],
				context?.previousStakeholders,
			);
			showErrorToast('Failed to delete stakeholder');
		},
		onSuccess: async (_data, stakeholder) => {
			await queryClient.refetchQueries({
				queryKey: ['stakeholder-matrixes', stakeholder.project_id],
			});
		},
	});
};
