import { useMemo } from 'react';
import { useGetInfluenceNodes } from './api/useGetInfluenceNodes';
import { convertToReactFlowNodes } from '../utils/convertToReactFlowNodes';
import { useSelectedProject } from './useSelectedProject';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../types';

const defaultValue: ReactFlowInfluenceNode[] = [];

export const useSelectedProjectInfluenceNodes = () => {
	const selectedProject = useSelectedProject();
	const projectIssues = useSelectedProjectIssues();
	const { nodes, isFetching } = useGetInfluenceNodes();
	const reactFlowNodes = useMemo(
		() =>
			convertToReactFlowNodes(nodes, projectIssues).filter(
				node => node.data.project_id === selectedProject?.id,
			),
		[nodes, projectIssues, selectedProject?.id],
	);
	if (!selectedProject) return { nodes: defaultValue, isFetching: false };
	return {
		nodes: reactFlowNodes,
		isFetching,
	};
};
