import React from 'react';
import { OpportunityStatments } from '../CreateProjectPage/OpportunityStatments';
import { ProjectInformation } from '../CreateProjectPage/ProjectInformation';
import { ProjectObjectives } from '../CreateProjectPage/ProjectObjectives';

export const ProjectDetails = () => {
	return (
		<>
			<ProjectInformation />
			<OpportunityStatments />
			<ProjectObjectives />
		</>
	);
};
