import { Edge as FlowEdge } from '@xyflow/react';
import ELK, { ElkExtendedEdge, ElkNode, ElkPoint } from 'elkjs/lib/elk.bundled.js';
import { ReactFlowInfluenceNode } from '../types';
import { InfluenceEdgeData, InfluenceEdgeRoute } from './convertToInfluenceEdges';

const elk = new ELK();

const defaultNodeWidth = 350;
const defaultNodeHeight = 180;

const getNodeWidth = (node: ReactFlowInfluenceNode) => {
	return node.measured?.width ?? node.width ?? defaultNodeWidth;
};

const getNodeHeight = (node: ReactFlowInfluenceNode) => {
	return node.measured?.height ?? node.height ?? defaultNodeHeight;
};

const toSvgPath = (points: ElkPoint[]) => {
	return points.reduce((path, point, index) => {
		const command = index === 0 ? 'M' : 'L';
		return `${path}${command} ${point.x} ${point.y} `;
	}, '');
};

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

const getInfluenceEdgeRoute = (edge: ElkExtendedEdge): InfluenceEdgeRoute | undefined => {
	const section = edge.sections?.[0];
	if (!section) return;

	const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].filter(
		(point): point is ElkPoint => !!point,
	);

	if (points.length < 2) return;
	return {
		path: toSvgPath(points).trim(),
		...getRouteLabelPosition(points),
	};
};

export const getInfluenceDiagramLayout = async (
	nodes: ReactFlowInfluenceNode[],
	edges: FlowEdge<InfluenceEdgeData>[],
) => {
	if (nodes.length < 2) {
		return {
			nodes,
			edges,
		};
	}

	const graph: ElkNode = {
		id: 'influence-diagram',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.edgeRouting': 'ORTHOGONAL',
			'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
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
			width: getNodeWidth(node),
			height: getNodeHeight(node),
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
	const routeByEdgeId = new Map<string, InfluenceEdgeRoute>(
		(layoutedGraph.edges ?? [])
			.map(layoutedEdge => {
				const route = getInfluenceEdgeRoute(layoutedEdge);
				return route ? ([layoutedEdge.id, route] as const) : undefined;
			})
			.filter((entry): entry is readonly [string, InfluenceEdgeRoute] => entry !== undefined),
	);

	return {
		nodes: nodes.map(node => {
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
		edges: edges.map(edge => ({
			...edge,
			data: {
				...edge.data,
				route: routeByEdgeId.get(edge.id),
			},
		})),
	};
};
