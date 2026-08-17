import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { DiscreteProbability, Issue, ProbabilityTable } from '../../validators';
import { useGetIssues } from './useGetIssues';

const defaultDiscreteProbabilities: DiscreteProbability[] = [];
export const useGetProbabilityTables = () => {
	const { issues } = useGetIssues();
	const { data: discreteProbabilities = defaultDiscreteProbabilities, ...rest } = useQuery({
		queryKey: ['probabilityTables'],
		queryFn: async () => {
			try {
				const response =
					await apiClient.get<DiscreteProbability[]>('/discrete_probabilities');

				return response.data;
			} catch {
				showErrorToast('Failed to fetch probability tables');
			}
		},
	});
	const data = useMemo(
		() => transformToProbabilityTables(discreteProbabilities, issues),
		[discreteProbabilities, issues],
	);
	return { data, ...rest };
};

const transformToProbabilityTables = (
	discreteProbabilities: DiscreteProbability[],
	issues: Issue[],
): ProbabilityTable[] => {
	const uncertaintyIds = Array.from(new Set(discreteProbabilities.map(dp => dp.uncertainty_id)));
	return issues
		.filter(issue => uncertaintyIds.some(id => issue.uncertainty.id === id))
		.map(issue => {
			const relevantUncertaintyIds = uncertaintyIds.filter(id => issue.uncertainty.id === id);
			return relevantUncertaintyIds.map(uncertaintyId => ({
				issue_id: issue.id,
				uncertainty_id: uncertaintyId,
				discrete_probabilities: discreteProbabilities.filter(
					dp => dp.uncertainty_id === uncertaintyId,
				),
			}));
		})
		.flat();
};
