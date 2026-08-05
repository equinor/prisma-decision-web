import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { DiscreteUtility, Issue, UtilityTable } from '../../validators';
import { useSelectedProjectIssues } from '../useSelectedProjectIssues';
import { useSelectedProject } from '../../components/ProjectPage/ProjectContext';

const defaultValue: UtilityTable[] = [];
export const useGetUtilityTables = () => {
	const issues = useSelectedProjectIssues();
	const selectedProject = useSelectedProject();
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['utilityTables', selectedProject.id],
		queryFn: async () => {
			try {
				const response = await apiClient.get<DiscreteUtility[]>('/discrete_utilities');

				return transformToUtilityTables(response.data, issues) || defaultValue;
			} catch {
				showErrorToast('Failed to fetch utility tables');
			}
		},
	});
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
