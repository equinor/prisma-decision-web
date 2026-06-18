import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiClient } from '../../api';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';

export type DecisionPath = string[];

export const getDecisionTreeQueryKey = (projectId?: string, paths: DecisionPath[] = []) =>
	['decisionTree', projectId, paths] as const;

export const fetchDecisionTree = async (projectId: string, paths: DecisionPath[]) => {
	const res = await apiClient.post<DecisionTree>(
		`/structure/${projectId}/partial_decision_tree/v3`,
		paths,
	);
	return res.data;
};

export const useGetDecisionTree = (projectId?: string, paths: DecisionPath[] = []) => {
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { data, ...rest } = useQuery({
		queryKey: getDecisionTreeQueryKey(projectId, paths),
		placeholderData: keepPreviousData,
		queryFn: async () => fetchDecisionTree(projectId!, paths),
		retry: false,
		enabled: !!projectId && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch decision tree',
		},
	});

	return {
		data: data,
		...rest,
	};
};

export const usePrefetchDecisionTree = () => {
	const queryClient = useQueryClient();
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	return useCallback(
		(projectId: string | undefined, paths: DecisionPath[]) => {
			if (!projectId || hasValidationError) {
				return;
			}
			const queryKey = getDecisionTreeQueryKey(projectId, paths);
			const queryState = queryClient.getQueryState(queryKey);

			if (queryState?.fetchStatus === 'fetching' || queryClient.getQueryData(queryKey)) {
				return;
			}

			queryClient.prefetchQuery({
				queryKey,
				queryFn: () => fetchDecisionTree(projectId, paths),
				retry: false,
				meta: {
					errorMessage: 'Failed to fetch decision tree',
				},
			});
		},
		[hasValidationError, queryClient],
	);
};
export type DecisionTree =
	| {
			id: string;
			probabilities: DecisionTreeProbability[];
			issue_id: string;
			utilities: DecisionTreeUtility[];
			parent_state_id: string | null;
			children: DecisionTree[];
			type: 'Decision' | 'Uncertainty';
			expected_value: number;
	  }
	| {
			id: string;
			cumulative_probability: number;
			endpoint_value: number;
			parent_state_id: string | null;
			probabilities: DecisionTreeProbability[] | null;
			utilities: DecisionTreeUtility[] | null;
			children: DecisionTree[];
			type: 'End';
			expected_value: number;
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
};

export type EndNode = {
	id: string;
	scenario_id: string;
	type: 'End';
};
