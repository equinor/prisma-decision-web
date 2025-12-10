import { useMemo } from 'react';
import { useGetInfluenceNodes } from './api/useGetInfluenceNodes';
import { useSelectedScenario } from './useSelectedScenario';
import { convertToReactFlowNodes } from '../utils/convertToReactFlowNodes';

export const useSelectedProjectInfluenceNodes = (handleClassName?: string) => {
	const selectedScenario = useSelectedScenario();
	const { nodes } = useGetInfluenceNodes();
	const reactFlowNodes = useMemo(
		() =>
			convertToReactFlowNodes(nodes, handleClassName).filter(
				node => node.data.node.scenario_id === selectedScenario?.id,
			),
		[nodes, selectedScenario?.id],
	);
	if (!selectedScenario) return [];
	return reactFlowNodes;
};
