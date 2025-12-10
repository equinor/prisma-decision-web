import { InfluenceNode } from '../validators';

export const convertToReactFlowNodes = (nodes: InfluenceNode[], handleClassName?: string) => {
	return nodes.map(node => ({
		id: node.id,
		type: 'issue',
		position: {
			x: node.node_style.x_position,
			y: node.node_style.y_position,
		},
		data: {
			node: node,
			handleClassName: handleClassName,
		},
	}));
};
