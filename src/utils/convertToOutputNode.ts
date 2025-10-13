import { Node } from '@xyflow/react';

export const convertToOutputNode = (id: string, path: Set<string>): Node => {
	return {
		id,
		type: 'outputNode',
		height: 150,
		width: 1,
		position: {
			x: 0,
			y: 0,
		},
		data: {
			path,
		},
	};
};
