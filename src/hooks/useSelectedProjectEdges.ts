import { useMemo } from 'react';
import { useGetEdges } from './api/useGetEdges';
import { useSelectedScenario } from './useSelectedScenario';

export const useSelectedProjectEdges = () => {
	const selectedScenario = useSelectedScenario();
	const { edges } = useGetEdges();
	const projectEdges = useMemo(
		() => edges.filter(edge => edge.scenario_id === selectedScenario?.id),
		[edges, selectedScenario?.id],
	);
	if (!selectedScenario) return [];
	return projectEdges;
};
