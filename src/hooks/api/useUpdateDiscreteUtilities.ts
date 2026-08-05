import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DiscreteUtility } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useUpdateDiscreteUtilities = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (util: DiscreteUtility) => {
			const res = await apiClient.put('/discrete_utilities', [util]);
			return res.data[0];
		},
		onError: () => {
			showErrorToast('Failed to update utilities');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['utilityTables'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
		},
	});
};
