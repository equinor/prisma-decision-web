import { useMemo } from 'react';
import { useGetStrategies } from './api/useGetStrategies';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useSelectedProjectStrategies = () => {
	const selectedProject = useSelectedProject();
	const { strategies, isLoading } = useGetStrategies();
	const projectStrategies = useMemo(
		() => strategies.filter(strategy => strategy.project_id === selectedProject.id),
		[strategies, selectedProject.id],
	);
	return {
		selectedStrategies: projectStrategies,
		isLoading,
	};
};
