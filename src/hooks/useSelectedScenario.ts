import { useParams } from 'react-router';
import { useSelectedProject } from './useSelectedProject';

export const useSelectedScenario = () => {
	const { scenarioId } = useParams<{ scenarioId: string }>();
	const selectedProject = useSelectedProject();

	if (!selectedProject) return;
	return selectedProject.scenarios.find(scenario => scenario.id === scenarioId);
};
