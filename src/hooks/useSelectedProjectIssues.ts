import { useMemo } from 'react';
import { useGetIssues } from './api/useGetIssues';
import { useSelectedScenario } from './useSelectedScenario';

export const useSelectedProjectIssues = () => {
	const selectedScenario = useSelectedScenario();
	const { issues } = useGetIssues();
	const projectIssues = useMemo(
		() => issues.filter(issue => issue.scenario_id === selectedScenario?.id),
		[issues, selectedScenario?.id],
	);
	if (!selectedScenario) return [];
	return projectIssues;
};
