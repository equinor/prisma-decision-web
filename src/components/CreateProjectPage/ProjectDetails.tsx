import { OpportunityStatments } from './OpportunityStatments';
import { ProjectInformation } from './ProjectInformation';
import { ProjectObjectives } from './ProjectObjectives';

export const ProjectDetails = () => {
	return (
		<>
			<ProjectInformation />
			<OpportunityStatments />
			<ProjectObjectives />
		</>
	);
};
