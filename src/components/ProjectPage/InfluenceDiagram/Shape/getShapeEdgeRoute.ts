import { InternalNode } from '@xyflow/react';
import { buildRoundedPolylinePath } from '../../../../utils/buildRoundedPolylinePath';
import { InfluenceEdgePoint, InfluenceEdgeRoute } from '../../../../utils/convertToInfluenceEdges';
import { getEdgeLabelPosition } from '../../../../utils/getEdgeLabelPosition';

export const getShapeEdgeRoute = (
	route: InfluenceEdgeRoute | undefined,
	source: InternalNode | undefined,
	target: InternalNode | undefined,
) => {
	if (!route || route.points.length < 2) return route;

	const points = [...route.points];
	points[0] = attachToShape(points[0], points[1], source);
	const lastIndex = points.length - 1;
	points[lastIndex] = attachToShape(points[lastIndex], points[lastIndex - 1], target);

	if (points.every((point, index) => point === route.points[index])) return route;

	return {
		...route,
		points,
		path: buildRoundedPolylinePath(points),
		...getEdgeLabelPosition(points),
	};
};

const attachToShape = (
	point: InfluenceEdgePoint,
	adjacentPoint: InfluenceEdgePoint,
	node: InternalNode | undefined,
): InfluenceEdgePoint => {
	const body = node?.internals.handleBounds?.target?.find(handle => handle.id === 'node-target');
	if (!body?.width || !body.height || !node) return point;

	const horizontal =
		Math.abs(adjacentPoint[0] - point[0]) >= Math.abs(adjacentPoint[1] - point[1]);
	const { x, y } = node.internals.positionAbsolute;
	const bodyX = x + body.x;
	const bodyY = y + body.y;
	const centerX = bodyX + body.width / 2;
	const centerY = bodyY + body.height / 2;
	const offset = horizontal
		? clamp((point[1] - centerY) / (body.height / 2))
		: clamp((point[0] - centerX) / (body.width / 2));
	const outlineScale =
		node.type === 'uncertainty'
			? Math.sqrt(Math.max(0, 1 - offset ** 2))
			: node.type === 'utility'
				? Math.max(0, 1 - Math.abs(offset))
				: 1;

	if (horizontal) {
		const side = adjacentPoint[0] >= point[0] ? 1 : -1;
		return [centerX + side * (body.width / 2) * outlineScale, point[1]];
	}

	const side = adjacentPoint[1] >= point[1] ? 1 : -1;
	return [point[0], centerY + side * (body.height / 2) * outlineScale];
};

const clamp = (value: number) => Math.max(-1, Math.min(1, value));
