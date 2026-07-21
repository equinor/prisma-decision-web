import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';

const defaultValue: string[] = [];
export const useGetPartialOrder = (projectId: string) => {
	return useQuery({
		queryKey: ['decisionTree', 'partialOrder', projectId],
		queryFn: async () => {
			try {
				const response = await apiClient.get<PartialOrderResponse>(
					`/structure/${projectId}/partial_order`,
				);
				return response.data.issue_ids || defaultValue;
			} catch {
				showErrorToast('Failed to fetch partial order');
			}
		},
	});
};

type PartialOrderResponse = {
	issue_ids: string[];
};
