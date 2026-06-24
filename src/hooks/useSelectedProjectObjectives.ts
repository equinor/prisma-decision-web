import { useMemo } from 'react';
import { useSelectedProject } from './useSelectedProject';
import { useGetObjectives } from './api/useGetObjectives';

export const useSelectedProjectObjectives = () => {
	const selectedProject = useSelectedProject();
	const { objectives, isFetching } = useGetObjectives();
	const projectObjectives = useMemo(
		() => objectives.filter(objective => objective.project_id === selectedProject?.id),
		[objectives, selectedProject?.id],
	);
	if (!selectedProject) return { selectedObjectives: [], isFetching: false };
	return {
		selectedObjectives: projectObjectives,
		isFetching,
	};
};
