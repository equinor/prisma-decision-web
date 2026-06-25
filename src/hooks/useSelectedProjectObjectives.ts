import { useMemo } from 'react';
import { useSelectedProject } from './useSelectedProject';
import { useGetObjectives } from './api/useGetObjectives';

export const useSelectedProjectObjectives = () => {
	const selectedProject = useSelectedProject();
	const { objectives, isLoading } = useGetObjectives();
	const projectObjectives = useMemo(
		() => objectives.filter(objective => objective.project_id === selectedProject?.id),
		[objectives, selectedProject?.id],
	);
	if (!selectedProject) return { selectedObjectives: [], isLoading: false };
	return {
		selectedObjectives: projectObjectives,
		isLoading,
	};
};
