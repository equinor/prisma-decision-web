import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiClient } from '../../api';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';
import { DecisionTree } from './useGetDecisionTree';

export type DecisionPath = string[];

export const getSolutionTreeQueryKey = (projectId: string, paths: DecisionPath[] = []) =>
	['decisionTree', 'solution', projectId, paths] as const;

export const fetchSolutionTree = async (projectId: string, paths: DecisionPath[]) => {
	const res = await apiClient.post<DecisionTree>(
		`solvers/project/${projectId}/partial_decision_tree/v3`,
		paths,
	);
	return res.data;
};
export const useGetSolutionTree = (projectId: string, paths: DecisionPath[] = []) => {
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { data, ...rest } = useQuery({
		queryKey: getSolutionTreeQueryKey(projectId, paths),
		placeholderData: keepPreviousData,
		queryFn: async () => fetchSolutionTree(projectId!, paths),
		retry: false,
		enabled: !!projectId && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch solution tree',
		},
	});
	return { data, ...rest };
};

export const usePrefetchSolutionTree = () => {
	const queryClient = useQueryClient();
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	return useCallback(
		(projectId: string | undefined, paths: DecisionPath[]) => {
			if (!projectId || hasValidationError) {
				return;
			}
			const queryKey = getSolutionTreeQueryKey(projectId, paths);
			const queryState = queryClient.getQueryState(queryKey);

			if (queryState?.fetchStatus === 'fetching' || queryClient.getQueryData(queryKey)) {
				return;
			}

			queryClient.prefetchQuery({
				queryKey,
				queryFn: () => fetchSolutionTree(projectId, paths),
				retry: false,
				meta: {
					errorMessage: 'Failed to fetch solution tree',
				},
			});
		},
		[hasValidationError, queryClient],
	);
};
