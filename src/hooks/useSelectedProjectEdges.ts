import { useMemo } from 'react';
import { useGetEdges } from './api/useGetEdges';
import { useSelectedProject } from './useSelectedProject';

export const useSelectedProjectEdges = () => {
	const selectedProject = useSelectedProject();
	const { edges, isFetching } = useGetEdges();
	const projectEdges = useMemo(
		() => edges.filter(edge => edge.project_id === selectedProject?.id),
		[edges, selectedProject?.id],
	);
	if (!selectedProject) return { edges: [], isFetching: false };
	return {
		edges: projectEdges,
		isFetching,
	};
};
