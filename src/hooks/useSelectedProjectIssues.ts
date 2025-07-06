import { useMemo } from 'react';
import { useGetIssues } from './api/useGetIssues';
import { useSelectedProject } from './useSelectedProject';

export const useSelectedProjectIssues = () => {
	const selectedProject = useSelectedProject();
	const { issues } = useGetIssues();
	const projectIssues = useMemo(
		() => issues.filter(issue => issue.scenario_id === selectedProject?.scenarios[0]?.id),
		[issues, selectedProject?.scenarios],
	);
	if (!selectedProject) return [];
	return projectIssues;
};
