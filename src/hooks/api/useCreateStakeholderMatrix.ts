import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { StakeholderMatrix } from '../../validators';

export const useCreateStakeholderMatrix = (args?: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (stakeholder: StakeholderMatrix) => {
			const response = await apiClient.post<StakeholderMatrix[]>(
				'/stakeholder-matrix-entry',
				[stakeholder],
			);
			return response.data[0];
		},
		onMutate: async stakeholder => {
			await queryClient.cancelQueries({
				queryKey: ['stakeholderMatrixes'],
			});
			const previousStakeholders =
				queryClient.getQueryData<StakeholderMatrix[]>(['stakeholderMatrixes']) ?? [];
			queryClient.setQueryData(
				['stakeholderMatrixes'],
				[...previousStakeholders, stakeholder],
			);
			return { previousStakeholders };
		},
		onError: (_error, _stakeholder, context) => {
			queryClient.setQueryData(['stakeholderMatrixes'], context?.previousStakeholders);
			showErrorToast('Failed to create stakeholder');
		},
		onSuccess: async () => {
			args?.onSuccess?.();
			await queryClient.refetchQueries({
				queryKey: ['stakeholderMatrixes'],
			});
		},
	});
};
