import { useMemo } from 'react';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { useGetStakeholderMatrixes } from './api/useGetStakeholderMatrixes';

export const useSelectedProjectStakeholders = () => {
	const projectId = useSelectedProject().id;
	const query = useGetStakeholderMatrixes();
	const stakeholders = useMemo(
		() => query.data.filter(stakeholder => stakeholder.project_id === projectId),
		[query.data, projectId],
	);
	return { ...query, data: stakeholders };
};
