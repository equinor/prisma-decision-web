import { Node } from '@xyflow/react';
import { Edge } from '../validators';

export type InfluenceEdgePoint = [number, number];

export type InfluenceEdgeRoute = {
	path: string;
	points: InfluenceEdgePoint[];
	labelX: number;
	labelY: number;
};

export type InfluenceEdgeData = {
	hovered?: boolean;
	route?: InfluenceEdgeRoute;
};

export const convertToInfluenceEdges = (edges: Edge[], nodes: Node[]) => {
	return edges.flatMap(edge => {
		const sourceNode = nodes.find(node => node.id === edge.tail_id);
		const targetNode = nodes.find(node => node.id === edge.head_id);
		if (!sourceNode || !targetNode) return [];

		return [
			{
				...edge,
				id: edge.id,
				source: edge.tail_id,
				target: edge.head_id,
			},
		];
	});
};
