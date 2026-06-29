import { useMemo } from 'react';
import { useGetEdges } from './api/useGetEdges';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useSelectedProjectEdges = () => {
	const selectedProject = useSelectedProject();
	const { edges, isFetching } = useGetEdges();
	const projectEdges = useMemo(
		() => edges.filter(edge => edge.project_id === selectedProject.id),
		[edges, selectedProject.id],
	);
	return {
		edges: projectEdges,
		isFetching,
	};
};
