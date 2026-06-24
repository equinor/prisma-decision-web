import { useMemo } from 'react';
import { useSelectedProject } from './useSelectedProject';
import { useGetStrategies } from './api/useGetStrategies';

export const useSelectedProjectStrategies = () => {
	const selectedProject = useSelectedProject();
	const { strategies, isFetching } = useGetStrategies();
	const projectStrategies = useMemo(
		() => strategies.filter(strategy => strategy.project_id === selectedProject?.id),
		[strategies, selectedProject?.id],
	);
	if (!selectedProject) return { selectedStrategies: [], isFetching: false };
	return {
		selectedStrategies: projectStrategies,
		isFetching,
	};
};
