import { Node } from '@xyflow/react';

export interface HandleInfo {
	sourceHandle: string;
	targetHandle: string;
}

/**
 * Calculate the best source and target handles based on the relative positions of two nodes
 */
export const calculateBestHandles = (sourceNode: Node, targetNode: Node): HandleInfo => {
	if (!sourceNode || !targetNode) {
		return { sourceHandle: 'a', targetHandle: 'a' };
	}

	// Use measured dimensions if available, otherwise use default card size estimate
	const sourceWidth = sourceNode.measured?.width ?? 200;
	const sourceHeight = sourceNode.measured?.height ?? 100;
	const targetWidth = targetNode.measured?.width ?? 200;
	const targetHeight = targetNode.measured?.height ?? 100;

	const sourceX = sourceNode.position.x + sourceWidth / 2;
	const sourceY = sourceNode.position.y + sourceHeight / 2;
	const targetX = targetNode.position.x + targetWidth / 2;
	const targetY = targetNode.position.y + targetHeight / 2;

	const deltaX = targetX - sourceX;
	const deltaY = targetY - sourceY;

	// Determine the primary direction based on the larger delta
	const absDeltaX = Math.abs(deltaX);
	const absDeltaY = Math.abs(deltaY);

	let sourceHandle: string;
	let targetHandle: string;

	if (absDeltaX > absDeltaY) {
		// Horizontal connection is primary
		if (deltaX > 0) {
			// Target is to the right of source
			sourceHandle = 'right';
			targetHandle = 'left';
		} else {
			// Target is to the left of source
			sourceHandle = 'left';
			targetHandle = 'right';
		}
	} else {
		// Vertical connection is primary
		if (deltaY > 0) {
			// Target is below source
			sourceHandle = 'bottom';
			targetHandle = 'top';
		} else {
			// Target is above source
			sourceHandle = 'top';
			targetHandle = 'bottom';
		}
	}

	return { sourceHandle, targetHandle };
};
