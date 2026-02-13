import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useGetDecisionTree = (projectId?: string) => {
	const { data, ...rest } = useQuery({
		queryKey: ['decisionTree', projectId],
		queryFn: async (): Promise<DecisionTree> => {
			const res = await apiClient.get<DecisionTree>(
				`/structure/${projectId}/decision_tree/v2`,
			);
			return res.data;
		},
		retry: false,
		enabled: !!projectId,
	});
	return { data, ...rest };
};
export type DecisionTree = {
	tree_node: {
		id: string;
		issue: Issue | EndNodeIssue;
		probabilities: DecisionTreeProbability[] | null;
		utilities: DecisionTreeUtility[] | null;
		children: DecisionTree[] | null;
		expected_value: number | null;
	};
};

export type DecisionTreeProbability = {
	discrete_probability_id: string;
	outcome_id: string;
	outcome_name: string;
	probability_value: number;
};

export type DecisionTreeUtility = {
	option_id: string | null;
	option_name: string | null;
	outcome_id: string | null;
	outcome_name: string | null;
	utility_value: number;
};

export type EndNodeIssue = {
	id: string;
	cumulative_probability: number;
	value: number;
	type: 'EndPoint';
};

export type EndNode = {
	id: string;
	scenario_id: string;
	type: 'EndPoint';
};
