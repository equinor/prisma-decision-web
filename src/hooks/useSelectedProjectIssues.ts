import { useMemo } from 'react';
import { useGetIssues } from './api/useGetIssues';
import { useSelectedProject } from './useSelectedProject';

export const useSelectedProjectIssues = () => {
	const selectedProject = useSelectedProject();
	const { issues } = useGetIssues();
	const projectIssues = useMemo(
		() => issues.filter(issue => issue.project_id === selectedProject?.id),
		[issues, selectedProject?.id],
	);
	if (!selectedProject) return [];
	return projectIssues;
};
