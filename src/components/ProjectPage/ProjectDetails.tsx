import { OpportunityStatments } from '../common/OpportunityStatments/OpportunityStatments';
import { ProjectInformation } from '../common/ProjectInformation';
import { ProjectObjectives } from '../common/ProjectObjectives/ProjectObjectives';

export const ProjectDetails = () => {
	return (
		<>
			<ProjectInformation />
			<OpportunityStatments />
			<ProjectObjectives />
		</>
	);
};
