import { useLocalStorage } from '@uidotdev/usehooks';
import { XYPosition } from '@xyflow/react';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export type InfluenceNodePositions = Record<string, XYPosition>;

const emptyPositions: InfluenceNodePositions = {};

export const useInfluenceDiagramCustomPositions = () => {
	const project = useSelectedProject();
	return useLocalStorage<InfluenceNodePositions>(
		`influenceDiagramCustomPositions-${project.id}`,
		emptyPositions,
	);
};
