import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useGetDecisionTree = (scenarioId?: string) => {
	return useQuery({
		queryKey: ['decisionTree', scenarioId],
		queryFn: async () => {
			const res = await apiClient.get<DecisionTree>(`/structure/${scenarioId}/decision_tree`);
			return res.data;
		},
		enabled: !!scenarioId,
	});
};

export type DecisionTree = {
	children: DecisionTree[] | null;
	tree_node: {
		id: string;
		issue: Issue | EndNodeIssue;
		probabilities: DecisionTreeProbability[] | null;
	};
};

export type DecisionTreeProbability = {
	discrete_probability_id: string;
	outcome_id: string;
	outcome_name: string;
	probability_value: number;
};

type EndNodeIssue = {
	id: string;
	scenario_id: string;
	type: 'EndPoint';
};

export type EndNode = {
	id: string;
	scenario_id: string;
	type: 'EndPoint';
};
