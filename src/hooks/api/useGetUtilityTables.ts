import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { DiscreteUtility, Issue, UtilityTable } from '../../validators';
import { useGetIssues } from './useGetIssues';

const defaultDiscreteUtilities: DiscreteUtility[] = [];
export const useGetUtilityTables = () => {
	const { issues } = useGetIssues();
	const { data: discreteUtilities = defaultDiscreteUtilities, ...rest } = useQuery({
		queryKey: ['utilityTables'],
		queryFn: async () => {
			try {
				const response = await apiClient.get<DiscreteUtility[]>('/discrete_utilities');

				return response.data;
			} catch {
				showErrorToast('Failed to fetch utility tables');
			}
		},
	});
	const data = useMemo(
		() => transformToUtilityTables(discreteUtilities, issues),
		[discreteUtilities, issues],
	);
	return { data, ...rest };
};

const transformToUtilityTables = (
	discreteProbabilities: DiscreteUtility[],
	issues: Issue[],
): UtilityTable[] => {
	const utiltiesIds = Array.from(new Set(discreteProbabilities.map(dp => dp.utility_id)));
	return issues
		.filter(issue => utiltiesIds.some(id => issue.utility.id === id))
		.map(issue => {
			const relevantUtilityIds = utiltiesIds.filter(id => issue.utility.id === id);
			return relevantUtilityIds.map(utilityId => ({
				issue_id: issue.id,
				utility_id: utilityId,
				discrete_utilities: discreteProbabilities.filter(dp => dp.utility_id === utilityId),
			}));
		})
		.flat();
};
