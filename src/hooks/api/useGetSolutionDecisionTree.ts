import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DecisionTree } from './useGetDecisionTree';

export const useGetSolutionDecisionTree = (projectId?: string) => {
	const { data, ...rest } = useQuery({
		queryKey: ['solutionDecisionTree', projectId],
		queryFn: async (): Promise<DecisionTree> => {
			const res = await apiClient.get<DecisionTree>(
				`/solvers/project/${projectId}/decision_tree`,
			);
			return res.data;
		},

		enabled: !!projectId,
	});
	return { data, ...rest };
};
