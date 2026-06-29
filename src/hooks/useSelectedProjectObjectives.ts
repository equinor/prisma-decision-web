import { useMemo } from 'react';
import { useGetObjectives } from './api/useGetObjectives';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useSelectedProjectObjectives = () => {
	const selectedProject = useSelectedProject();
	const { objectives, isLoading } = useGetObjectives();
	const projectObjectives = useMemo(
		() => objectives.filter(objective => objective.project_id === selectedProject.id),
		[objectives, selectedProject.id],
	);
	return {
		selectedObjectives: projectObjectives,
		isLoading,
	};
};
