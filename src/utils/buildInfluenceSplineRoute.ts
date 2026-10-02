import { InfluenceEdgePoint, InfluenceEdgeRoute } from './convertToInfluenceEdges';

export type InfluenceShape = 'rectangle' | 'ellipse' | 'diamond';
export type InfluenceSide = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
export type InfluenceNodeRect = {
	x: number;
	y: number;
	width: number;
	height: number;
	shape: InfluenceShape;
};

export type InfluenceSplineEdge = {
	id: string;
	sourceId: string;
	targetId: string;
	source: InfluenceNodeRect;
	target: InfluenceNodeRect;
};

type Anchor = { point: InfluenceEdgePoint; side: InfluenceSide };
type SplinePlan = { start: Anchor; end: Anchor; straight: boolean };

const minLegLength = 16;
const anchorGap = 12;
// Keeps spread anchors on the steep middle part of ellipse and diamond outlines
const maxAnchorSpread = 0.6;
// Sampled points are only used to animate between spline and orthogonal routes
const sampleCount = 16;

export const exitsHorizontally = (side: InfluenceSide) => side === 'EAST' || side === 'WEST';

export const getShapeForNodeType = (type: string | undefined): InfluenceShape =>
	type === 'uncertainty' ? 'ellipse' : type === 'utility' ? 'diamond' : 'rectangle';

// Moves an anchor on the bounding box inwards until it meets the shape outline.
export const clipToShapeOutline = (
	point: InfluenceEdgePoint,
	rect: InfluenceNodeRect,
	side: InfluenceSide,
): InfluenceEdgePoint => {
	if (rect.shape === 'rectangle') return point;
	const [centerX, centerY] = getCenter(rect);
	const halfWidth = rect.width / 2;
	const halfHeight = rect.height / 2;
	const horizontal = exitsHorizontally(side);
	const along = Math.min(
		1,
		horizontal
			? Math.abs(point[1] - centerY) / halfHeight
			: Math.abs(point[0] - centerX) / halfWidth,
	);
	const depth = rect.shape === 'ellipse' ? Math.sqrt(1 - along * along) : 1 - along;

	return horizontal
		? [centerX + (side === 'EAST' ? 1 : -1) * halfWidth * depth, point[1]]
		: [point[0], centerY + (side === 'SOUTH' ? 1 : -1) * halfHeight * depth];
};

// One-bend splines; edges sharing a node side get separate anchors so they don't merge.
export const buildInfluenceSplineRoutes = (edges: InfluenceSplineEdge[]) => {
	const plans = new Map(edges.map(edge => [edge.id, getSplinePlan(edge.source, edge.target)]));
	spreadSharedAnchors(edges, plans);

	return new Map(
		edges.flatMap(edge => {
			const plan = plans.get(edge.id);
			return plan ? [[edge.id, buildRoute(plan, edge)] as const] : [];
		}),
	);
};

const buildRoute = (plan: SplinePlan, edge: InfluenceSplineEdge): InfluenceEdgeRoute => {
	const start = clipToShapeOutline(plan.start.point, edge.source, plan.start.side);
	const end = clipToShapeOutline(plan.end.point, edge.target, plan.end.side);
	const control: InfluenceEdgePoint = plan.straight
		? [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
		: exitsHorizontally(plan.start.side)
			? [end[0], start[1]]
			: [start[0], end[1]];
	const points = Array.from({ length: sampleCount + 1 }, (_, index) =>
		getQuadraticPoint(start, control, end, index / sampleCount),
	);
	const [labelX, labelY] = getQuadraticPoint(start, control, end, 0.5);

	return {
		path: `M ${start[0]} ${start[1]} Q ${control[0]} ${control[1]} ${end[0]} ${end[1]}`,
		points,
		labelX,
		labelY,
	};
};

const spreadSharedAnchors = (edges: InfluenceSplineEdge[], plans: Map<string, SplinePlan>) => {
	const groups = new Map<
		string,
		{ anchor: Anchor; rect: InfluenceNodeRect; sortKey: number }[]
	>();
	const addToGroup = (
		nodeId: string,
		anchor: Anchor,
		rect: InfluenceNodeRect,
		other: InfluenceNodeRect,
	) => {
		const key = `${nodeId}:${anchor.side}`;
		const [otherX, otherY] = getCenter(other);
		const sortKey = exitsHorizontally(anchor.side) ? otherY : otherX;
		groups.set(key, [...(groups.get(key) ?? []), { anchor, rect, sortKey }]);
	};

	for (const edge of edges) {
		const plan = plans.get(edge.id);
		if (!plan) continue;
		addToGroup(edge.sourceId, plan.start, edge.source, edge.target);
		addToGroup(edge.targetId, plan.end, edge.target, edge.source);
	}

	for (const members of groups.values()) {
		if (members.length < 2) continue;
		members.sort((a, b) => a.sortKey - b.sortKey);
		const { side } = members[0].anchor;
		const { rect } = members[0];
		const sideLength = exitsHorizontally(side) ? rect.height : rect.width;
		const gap = Math.min(anchorGap, (sideLength * maxAnchorSpread) / (members.length - 1));

		members.forEach(({ anchor }, index) => {
			const offset = (index - (members.length - 1) / 2) * gap;
			const [x, y] = anchor.point;
			anchor.point = exitsHorizontally(side) ? [x, y + offset] : [x + offset, y];
		});
	}
};

const getCenter = (rect: InfluenceNodeRect): InfluenceEdgePoint => [
	rect.x + rect.width / 2,
	rect.y + rect.height / 2,
];

const getSidePoint = (rect: InfluenceNodeRect, side: InfluenceSide): Anchor => {
	const [centerX, centerY] = getCenter(rect);
	const point: Record<InfluenceSide, InfluenceEdgePoint> = {
		NORTH: [centerX, rect.y],
		SOUTH: [centerX, rect.y + rect.height],
		EAST: [rect.x + rect.width, centerY],
		WEST: [rect.x, centerY],
	};
	return { point: point[side], side };
};

const getSplinePlan = (source: InfluenceNodeRect, target: InfluenceNodeRect): SplinePlan => {
	const [sourceX, sourceY] = getCenter(source);
	const [targetX, targetY] = getCenter(target);
	const dx = targetX - sourceX;
	const dy = targetY - sourceY;
	const horizontalSides = {
		start: dx > 0 ? 'EAST' : 'WEST',
		end: dx > 0 ? 'WEST' : 'EAST',
	} as const;
	const verticalSides = {
		start: dy > 0 ? 'SOUTH' : 'NORTH',
		end: dy > 0 ? 'NORTH' : 'SOUTH',
	} as const;
	// Leave sideways and enter from above/below, or the other way around
	const horizontalFirst = getBendPlan(source, target, horizontalSides.start, verticalSides.end);
	const verticalFirst = getBendPlan(source, target, verticalSides.start, horizontalSides.end);
	const preferHorizontal = Math.abs(dx) >= Math.abs(dy);
	const bend = preferHorizontal
		? (horizontalFirst ?? verticalFirst)
		: (verticalFirst ?? horizontalFirst);
	if (bend) return bend;

	const sides = preferHorizontal ? horizontalSides : verticalSides;
	return {
		start: getSidePoint(source, sides.start),
		end: getSidePoint(target, sides.end),
		straight: true,
	};
};

const getBendPlan = (
	source: InfluenceNodeRect,
	target: InfluenceNodeRect,
	startSide: InfluenceSide,
	endSide: InfluenceSide,
): SplinePlan | undefined => {
	const start = getSidePoint(source, startSide);
	const end = getSidePoint(target, endSide);
	const dx = end.point[0] - start.point[0];
	const dy = end.point[1] - start.point[1];
	const horizontalLegOk =
		Math.abs(dx) >= minLegLength &&
		(startSide === 'EAST' ? dx > 0 : startSide === 'WEST' ? dx < 0 : true);
	const verticalLegOk =
		Math.abs(dy) >= minLegLength &&
		(endSide === 'NORTH' ? dy > 0 : endSide === 'SOUTH' ? dy < 0 : true);
	const verticalStartOk = startSide === 'SOUTH' ? dy > 0 : startSide === 'NORTH' ? dy < 0 : true;
	const horizontalEndOk = endSide === 'WEST' ? dx > 0 : endSide === 'EAST' ? dx < 0 : true;
	if (!horizontalLegOk || !verticalLegOk || !verticalStartOk || !horizontalEndOk) return;

	return { start, end, straight: false };
};

const getQuadraticPoint = (
	start: InfluenceEdgePoint,
	control: InfluenceEdgePoint,
	end: InfluenceEdgePoint,
	t: number,
): InfluenceEdgePoint => {
	const inverse = 1 - t;
	return [
		inverse * inverse * start[0] + 2 * inverse * t * control[0] + t * t * end[0],
		inverse * inverse * start[1] + 2 * inverse * t * control[1] + t * t * end[1],
	];
};
