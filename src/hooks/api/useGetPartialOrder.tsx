import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';

const defaultValue: string[] = [];
export const useGetPartialOrder = (projectId?: string) => {
	return useQuery({
		queryKey: ['decisionTree', 'partialOrder', projectId],
		queryFn: async () => {
			const response = await apiClient.get<PartialOrderResponse>(
				`/structure/${projectId}/partial_order`,
			);
			return response.data.issue_ids || defaultValue;
		},
	});
};

type PartialOrderResponse = {
	issue_ids: string[];
};
