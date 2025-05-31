import { OpportunityStatments } from '../common/OpportunityStatments';
import { ProjectInformation } from '../common/ProjectInformation';
import { ProjectObjectives } from '../common/ProjectObjectives';

export const ProjectDetails = () => {
	return (
		<>
			<ProjectInformation />
			<OpportunityStatments />
			<ProjectObjectives />
		</>
	);
};
