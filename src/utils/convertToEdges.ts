import { Node } from '@xyflow/react';
import { Edge } from '../validators';
import { calculateBestHandles } from './calculateBestHandles';

export const convertToEdges = (edges: Edge[], nodes: Node[]) => {
	return edges.map(edge => {
		const sourceNode = nodes.find(node => node.id === edge.tail_id);
		const targetNode = nodes.find(node => node.id === edge.head_id);

		const { sourceHandle, targetHandle } = calculateBestHandles(targetNode!, sourceNode!);

		return {
			...edge,
			id: edge.id,
			source: edge.head_id,
			target: edge.tail_id,
			sourceHandle,
			targetHandle,
		};
	});
};
