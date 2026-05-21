import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DecisionTree } from './useGetDecisionTree';

export const useGetSolutionTree = (projectId?: string) => {
	const { data, ...rest } = useQuery({
		queryKey: ['decisionTree', 'solution', projectId],
		queryFn: async () => {
			const res = await apiClient.get<DecisionTree>(
				`/solvers/project/${projectId}/decision_tree/v2`,
			);
			return res.data;
		},
		retry: false,
		enabled: !!projectId,
		meta: {
			errorMessage: 'Failed to fetch solution tree',
		},
	});
	return { data, ...rest };
};
