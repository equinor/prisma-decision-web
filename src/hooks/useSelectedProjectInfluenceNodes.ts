import { useMemo } from 'react';
import { useGetInfluenceNodes } from './api/useGetInfluenceNodes';
import { convertToReactFlowNodes } from '../utils/convertToReactFlowNodes';
import { useSelectedProject } from './useSelectedProject';

export const useSelectedProjectInfluenceNodes = () => {
	const selectedProject = useSelectedProject();
	const { nodes } = useGetInfluenceNodes();
	const reactFlowNodes = useMemo(
		() =>
			convertToReactFlowNodes(nodes).filter(
				node => node.data.project_id === selectedProject?.id,
			),
		[nodes, selectedProject?.id],
	);
	if (!selectedProject) return [];
	return reactFlowNodes;
};
