import { Edge as FlowEdge } from '@xyflow/react';
import ELK, { ElkExtendedEdge, ElkNode, ElkPoint } from 'elkjs/lib/elk.bundled.js';
import { ReactFlowInfluenceNode } from '../types';
import { InfluenceEdgeData } from './convertToInfluenceEdges';

const elk = new ELK();

const defaultNodeWidth = 350;
const defaultNodeHeight = 140;

const getRouteLabelPosition = (points: ElkPoint[]) => {
	if (points.length < 2) {
		return {
			labelX: points[0]?.x ?? 0,
			labelY: points[0]?.y ?? 0,
		};
	}

	const segments = points.slice(1).map((point, index) => {
		const previousPoint = points[index];
		const length = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);

		return {
			start: previousPoint,
			end: point,
			length,
		};
	});

	const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
	const halfwayLength = totalLength / 2;
	let travelled = 0;

	for (const segment of segments) {
		if (travelled + segment.length >= halfwayLength) {
			const distanceIntoSegment = halfwayLength - travelled;
			const ratio = segment.length === 0 ? 0 : distanceIntoSegment / segment.length;

			return {
				labelX: segment.start.x + (segment.end.x - segment.start.x) * ratio,
				labelY: segment.start.y + (segment.end.y - segment.start.y) * ratio,
			};
		}

		travelled += segment.length;
	}

	const lastPoint = points.at(-1) ?? points[0];
	return {
		labelX: lastPoint.x,
		labelY: lastPoint.y,
	};
};

function makeRoundedPath(points: ElkPoint[], bends: ElkPoint[], radius = 8) {
	if (!points.length) return '';

	const bendSet = new Set(bends.map(b => `${b.x},${b.y}`));

	let d = `M ${points[0].x} ${points[0].y}`;

	for (let i = 1; i < points.length - 1; i++) {
		const prev = points[i - 1];
		const curr = points[i];
		const next = points[i + 1];

		const isBend = bendSet.has(`${curr.x},${curr.y}`);

		if (!isBend) {
			d += ` L ${curr.x} ${curr.y}`;
			continue;
		}

		// Incoming vector
		const vx1 = curr.x - prev.x;
		const vy1 = curr.y - prev.y;

		// Outgoing vector
		const vx2 = next.x - curr.x;
		const vy2 = next.y - curr.y;

		const len1 = Math.hypot(vx1, vy1);
		const len2 = Math.hypot(vx2, vy2);

		if (len1 === 0 || len2 === 0) {
			d += ` L ${curr.x} ${curr.y}`;
			continue;
		}

		// Prevent radius from exceeding segment lengths
		const r = Math.min(radius, len1 / 2, len2 / 2);

		// Point before the bend
		const p1 = {
			x: curr.x - (vx1 / len1) * r,
			y: curr.y - (vy1 / len1) * r,
		};

		// Point after the bend
		const p2 = {
			x: curr.x + (vx2 / len2) * r,
			y: curr.y + (vy2 / len2) * r,
		};

		// Straight line into rounded corner
		d += ` L ${p1.x} ${p1.y}`;

		// Rounded bend
		d += ` Q ${curr.x} ${curr.y} ${p2.x} ${p2.y}`;
	}

	// Final line
	const last = points[points.length - 1];
	d += ` L ${last.x} ${last.y}`;

	return d;
}

const getInfluenceEdgeRoute = (edge: ElkExtendedEdge) => {
	const section = edge.sections?.[0];
	if (!section) return;

	const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].filter(
		(point): point is ElkPoint => !!point,
	);

	if (points.length < 2) return;
	const labelPositions = getRouteLabelPosition(points);
	const path = makeRoundedPath(points, section.bendPoints ?? []);
	return {
		path,
		labelX: labelPositions.labelX,
		labelY: labelPositions.labelY,
	};
};

export const getInfluenceDiagramLayout = async (
	nodes: ReactFlowInfluenceNode[],
	edges: FlowEdge<InfluenceEdgeData>[],
) => {
	if (nodes.length < 2) {
		return {
			positionedNodes: nodes,
			positionedEdges: edges,
		};
	}

	const graph: ElkNode = {
		id: 'influence-diagram',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.interactive': 'true',
			'elk.edgeRouting': 'ORTHOGONAL',
			'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
			'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
			'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
			'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
			'elk.layered.unnecessaryBendpoints': 'true',
			'elk.spacing.edgeEdge': '30',
			'elk.spacing.edgeNode': '70',
			'elk.spacing.nodeNode': '100',
			'elk.layered.spacing.edgeNodeBetweenLayers': '100',
			'elk.layered.spacing.nodeNodeBetweenLayers': '250',
		},
		children: nodes.map(node => ({
			id: node.id,
			width: node.measured?.width ?? defaultNodeWidth,
			height: node.measured?.height ?? defaultNodeHeight,
		})),
		edges: edges.map(edge => ({
			id: edge.id,
			sources: [edge.source],
			targets: [edge.target],
		})),
	};

	const layoutedGraph = await elk.layout(graph);
	const layoutedNodesById = new Map(
		(layoutedGraph.children ?? []).map(layoutedNode => [layoutedNode.id, layoutedNode]),
	);
	const routeByEdgeId = new Map(
		(layoutedGraph.edges ?? [])
			.map(layoutedEdge => {
				const route = getInfluenceEdgeRoute(layoutedEdge);
				return route ? ([layoutedEdge.id, route] as const) : undefined;
			})
			.filter(entry => entry !== undefined),
	);

	return {
		positionedNodes: nodes.map(node => {
			const layoutedNode = layoutedNodesById.get(node.id);
			if (!layoutedNode) return node;
			return {
				...node,
				position: {
					x: layoutedNode.x ?? node.position.x,
					y: layoutedNode.y ?? node.position.y,
				},
			};
		}),
		positionedEdges: edges.map(edge => ({
			...edge,
			data: {
				...edge.data,
				route: routeByEdgeId.get(edge.id),
			},
		})),
	};
};
