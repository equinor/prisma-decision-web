import { useParams } from 'react-router';
import { useGetProjects } from './api/useGetProjects';

export const useSelectedProject = () => {
	const { projectId } = useParams<{ projectId: string }>();
	const { projects } = useGetProjects();
	return projects.find(project => project.id === projectId);
};
