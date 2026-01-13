import { useMemo } from 'react';
import { useGetInfluenceNodes } from './api/useGetInfluenceNodes';
import { useSelectedScenario } from './useSelectedScenario';
import { convertToReactFlowNodes } from '../utils/convertToReactFlowNodes';

export const useSelectedProjectInfluenceNodes = () => {
	const selectedScenario = useSelectedScenario();
	const { nodes } = useGetInfluenceNodes();
	const reactFlowNodes = useMemo(
		() =>
			convertToReactFlowNodes(nodes).filter(
				node => node.data.scenario_id === selectedScenario?.id,
			),
		[nodes, selectedScenario?.id],
	);
	if (!selectedScenario) return [];
	return reactFlowNodes;
};
