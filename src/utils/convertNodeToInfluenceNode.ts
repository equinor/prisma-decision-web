import { ReactFlowInfluenceNode } from '../types';
import { InfluenceNode } from '../validators';

export const convertNodeToInfluenceNode = (nodes: ReactFlowInfluenceNode[]): InfluenceNode[] => {
	return nodes.map(node => {
		return {
			...node.data.node,
			node_style: {
				...node.data.node.node_style,
				x_position: Math.floor(node.position.x),
				y_position: Math.floor(node.position.y),
			},
		};
	});
};
