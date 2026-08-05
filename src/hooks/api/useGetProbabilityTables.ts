import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { DiscreteProbability, Issue, ProbabilityTable } from '../../validators';
import { useSelectedProjectIssues } from '../useSelectedProjectIssues';
import { useSelectedProject } from '../../components/ProjectPage/ProjectContext';

const defaultValue: ProbabilityTable[] = [];
export const useGetProbabilityTables = () => {
	const issues = useSelectedProjectIssues();
	const selectedProject = useSelectedProject();
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['probabilityTables', selectedProject.id],
		queryFn: async () => {
			try {
				const response =
					await apiClient.get<DiscreteProbability[]>('/discrete_probabilities');

				return transformToProbabilityTables(response.data, issues) || defaultValue;
			} catch {
				showErrorToast('Failed to fetch probability tables');
			}
		},
	});
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
