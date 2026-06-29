import { useMemo } from 'react';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { convertToReactFlowNodes } from '../utils/convertToReactFlowNodes';
import { useGetInfluenceNodes } from './api/useGetInfluenceNodes';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';

export const useSelectedProjectInfluenceNodes = () => {
	const selectedProject = useSelectedProject();
	const projectIssues = useSelectedProjectIssues();
	const { nodes, isFetching } = useGetInfluenceNodes();
	const reactFlowNodes = useMemo(
		() =>
			convertToReactFlowNodes(nodes, projectIssues).filter(
				node => node.data.project_id === selectedProject.id,
			),
		[nodes, projectIssues, selectedProject.id],
	);
	return {
		nodes: reactFlowNodes,
		isFetching,
	};
};
