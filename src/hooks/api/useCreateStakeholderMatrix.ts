import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { StakeholderMatrix } from '../../validators';

export const useCreateStakeholderMatrix = (args?: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (stakeholder: StakeholderMatrix) => {
			const response = await apiClient.post<StakeholderMatrix[]>('/stakeholder-matrix', [
				stakeholder,
			]);
			return response.data[0];
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
				[...previousStakeholders, stakeholder],
			);
			return { previousStakeholders };
		},
		onError: (_error, _stakeholder, context) => {
			queryClient.setQueryData(
				['stakeholder-matrixes', context?.previousStakeholders[0]?.project_id],
				context?.previousStakeholders,
			);
			showErrorToast('Failed to create stakeholder');
		},
		onSuccess: async (_data, stakeholder) => {
			args?.onSuccess?.();
			await queryClient.refetchQueries({
				queryKey: ['stakeholder-matrixes', stakeholder.project_id],
			});
		},
	});
};
