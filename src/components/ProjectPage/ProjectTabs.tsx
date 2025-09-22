import { Button } from '@equinor/eds-core-react';
import { Link } from 'react-router';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { useSelectedScenario } from '../../hooks/useSelectedScenario';

export const ProjectTabs = () => {
	const selectedScenario = useSelectedScenario();
	const selectedProject = useSelectedProject();
	let view = 0;
	if (location.pathname.includes('objectives')) view = 2;
	if (location.pathname.includes('opportunities')) view = 1;
	if (location.pathname.includes('issues')) view = 3;
	if (!selectedProject || !selectedScenario) return;
	return (
		<Button.Toggle selectedIndexes={[view]}>
			<Button as={Link} to={`/project/${selectedProject.id}/${selectedScenario.id}`}>
				Project Details
			</Button>
			<Button
				as={Link}
				to={`/project/${selectedProject.id}/${selectedScenario.id}/opportunities`}
			>
				Opportunities
			</Button>
			<Button
				as={Link}
				to={`/project/${selectedProject.id}/${selectedScenario.id}/objectives`}
			>
				Objectives
			</Button>
			<Button as={Link} to={`/project/${selectedProject.id}/${selectedScenario.id}/issues`}>
				Issues
			</Button>
		</Button.Toggle>
	);
};
