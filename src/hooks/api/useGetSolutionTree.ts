import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DecisionTree } from './useGetDecisionTree';
import { showErrorToast } from '../../components/ShowToast';

export const useGetSolutionTree = (projectId?: string) => {
	const { data, ...rest } = useQuery({
		queryKey: ['decisionTree', 'solution', projectId],
		queryFn: async (): Promise<DecisionTree | undefined> => {
			try {
				const res = await apiClient.get<DecisionTree>(
					`/solvers/project/${projectId}/decision_tree/v2`,
				);
				return res.data;
			} catch {
				showErrorToast('Failed to fetch solution tree');
			}
		},
		retry: false,
		enabled: !!projectId,
	});
	return { data, ...rest };
};
