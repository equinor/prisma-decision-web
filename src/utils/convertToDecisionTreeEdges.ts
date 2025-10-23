import { Edge } from '@xyflow/react';
export const convertToDecisionTreeEdges = (edges: Edge[]) => {
	return edges.map(edge => {
		return {
			...edge,
			tail_id: edge.source,
			head_id: edge.target,
		};
	});
};
