import { Edge } from '@xyflow/react';

export const buildDecisionTreeEdge = (sourceId: string, targetId: string, animated = false) => {
	const newEdge: Edge = {
		id: `e${sourceId}-${targetId}`,
		source: sourceId,
		target: targetId,
		type: 'decisionTreeEdge',
		zIndex: animated ? 1 : 0,
		animated,
	};
	return newEdge;
};
