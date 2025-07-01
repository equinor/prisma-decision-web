import { useParams } from 'react-router';
import { useGetProjects } from './api/useGetProjects';

export const useSelectedProject = () => {
	const { id } = useParams<{ id: string }>();
	const projects = useGetProjects();
	return projects.find(project => project.id === id);
};
