import { Edge as FlowEdge } from '@xyflow/react';
import ELK, { ElkExtendedEdge, ElkNode, ElkPort, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { InfluenceNodePositions } from '../hooks/useInfluenceDiagramCustomPositions';
import { InfluenceDiagramNodeView } from '../hooks/useInfluenceDiagramNodeView';
import { ReactFlowInfluenceNode } from '../types';
import {
	buildInfluenceSplineRoutes,
	clipToShapeOutline,
	getShapeForNodeType,
	InfluenceNodeRect,
	InfluenceSide,
} from './buildInfluenceSplineRoute';
import { buildRoundedPolylinePath } from './buildRoundedPolylinePath';
import { InfluenceEdgeData, InfluenceEdgePoint } from './convertToInfluenceEdges';
import { getEdgeLabelPosition } from './getEdgeLabelPosition';

const elk = new ELK();

const defaultNodeWidth = 350;
const defaultNodeHeight = 140;

type EndpointClip = {
	source: InfluenceNodeRect;
	target: InfluenceNodeRect;
	outSide: InfluenceSide;
	inSide: InfluenceSide;
};

const getInfluenceEdgeRoute = (edge: ElkExtendedEdge, clip?: EndpointClip) => {
	const section = edge.sections?.[0];
	if (!section) return;

	const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].filter(
		point => !!point,
	);

	if (points.length < 2) return;
	const pathPoints = points.map(point => [point.x, point.y] as InfluenceEdgePoint);
	if (clip) {
		pathPoints[0] = clipToShapeOutline(pathPoints[0], clip.source, clip.outSide);
		pathPoints[pathPoints.length - 1] = clipToShapeOutline(
			pathPoints[pathPoints.length - 1],
			clip.target,
			clip.inSide,
		);
	}
	const { labelX, labelY } = getEdgeLabelPosition(pathPoints);

	const path = buildRoundedPolylinePath(pathPoints);
	return {
		path,
		points: pathPoints,
		labelX,
		labelY,
	};
};

const inPortId = (edgeId: string) => `${edgeId}__in`;
const outPortId = (edgeId: string) => `${edgeId}__out`;

const getPortSides = (direction: string | undefined) => {
	const [inSide, outSide]: [InfluenceSide, InfluenceSide] =
		direction === 'LEFT'
			? ['EAST', 'WEST']
			: direction === 'DOWN'
				? ['NORTH', 'SOUTH']
				: direction === 'UP'
					? ['SOUTH', 'NORTH']
					: ['WEST', 'EAST'];
	return { inSide, outSide };
};

// One port per edge so arrows sharing a node side don't merge; ELK orders them to avoid crossings.
const getEdgePorts = (
	nodeId: string,
	edges: FlowEdge<InfluenceEdgeData>[],
	sides: { inSide: InfluenceSide; outSide: InfluenceSide },
): ElkPort[] =>
	[
		...edges
			.filter(edge => edge.target === nodeId)
			.map(edge => ({ id: inPortId(edge.id), side: sides.inSide })),
		...edges
			.filter(edge => edge.source === nodeId)
			.map(edge => ({ id: outPortId(edge.id), side: sides.outSide })),
	].map(({ id, side }) => ({
		id,
		width: 0,
		height: 0,
		layoutOptions: { 'elk.port.side': side },
	}));

export const getInfluenceDiagramLayout = async (
	nodes: ReactFlowInfluenceNode[],
	edges: FlowEdge<InfluenceEdgeData>[],
	layoutOptions: LayoutOptions,
	nodeView: InfluenceDiagramNodeView = 'card',
	customPositions: InfluenceNodePositions = {},
) => {
	const layout = await getAutomaticLayout(nodes, edges, layoutOptions, nodeView);
	if (nodeView !== 'shape') return layout;

	const positionedNodes = layout.positionedNodes.map(node => {
		const customPosition = customPositions[node.id];
		return customPosition ? { ...node, position: customPosition } : node;
	});

	return {
		positionedNodes,
		positionedEdges: rerouteCustomEdges(
			positionedNodes,
			layout.positionedEdges,
			new Set(Object.keys(customPositions)),
		),
	};
};

const getNodeRect = (node: ReactFlowInfluenceNode): InfluenceNodeRect => ({
	x: node.position.x,
	y: node.position.y,
	width: node.measured?.width ?? node.width ?? defaultNodeWidth,
	height: node.measured?.height ?? node.height ?? defaultNodeHeight,
	shape: getShapeForNodeType(node.type),
});

// Edges touching a freely placed node are drawn as one-bend splines instead of the ELK route.
export const rerouteCustomEdges = (
	nodes: ReactFlowInfluenceNode[],
	edges: FlowEdge<InfluenceEdgeData>[],
	customNodeIds: ReadonlySet<string>,
	skipAnimation = false,
) => {
	if (customNodeIds.size === 0) return edges;
	const nodesById = new Map(nodes.map(node => [node.id, node]));
	const routes = buildInfluenceSplineRoutes(
		edges.flatMap(edge => {
			if (!customNodeIds.has(edge.source) && !customNodeIds.has(edge.target)) return [];
			const sourceNode = nodesById.get(edge.source);
			const targetNode = nodesById.get(edge.target);
			if (!sourceNode || !targetNode) return [];
			return [
				{
					id: edge.id,
					sourceId: edge.source,
					targetId: edge.target,
					source: getNodeRect(sourceNode),
					target: getNodeRect(targetNode),
				},
			];
		}),
	);

	return edges.map(edge => {
		const route = routes.get(edge.id);
		if (!route) return edge;
		return {
			...edge,
			data: { ...edge.data, route: { ...route, skipAnimation } },
		};
	});
};

const getAutomaticLayout = async (
	nodes: ReactFlowInfluenceNode[],
	edges: FlowEdge<InfluenceEdgeData>[],
	layoutOptions: LayoutOptions,
	nodeView: InfluenceDiagramNodeView,
) => {
	if (nodes.length < 2) {
		return {
			positionedNodes: nodes,
			positionedEdges: edges,
		};
	}

	const usePorts = nodeView === 'shape';
	const portSides = getPortSides(layoutOptions['elk.direction']);
	const graph: ElkNode = {
		id: 'influence-diagram',
		layoutOptions: {
			...layoutOptions,
			'elk.algorithm.graphviz': 'dot',
			'elk.spacing.edgeEdge': '20',
			'elk.layered.spacing.edgeEdgeBetweenLayers': '20',
		},
		children: nodes.map(node => {
			const width = node.measured?.width ?? defaultNodeWidth;
			const height = node.measured?.height ?? defaultNodeHeight;
			if (!usePorts) return { id: node.id, width, height };
			return {
				id: node.id,
				width,
				height,
				layoutOptions: {
					'elk.portConstraints': 'FIXED_SIDE',
					'elk.portAlignment.default': 'CENTER',
					'elk.spacing.portPort': '12',
				},
				ports: getEdgePorts(node.id, edges, portSides),
			};
		}),
		edges: edges.map(edge => ({
			id: edge.id,
			sources: [usePorts ? outPortId(edge.id) : edge.source],
			targets: [usePorts ? inPortId(edge.id) : edge.target],
		})),
	};

	const layoutedGraph = await elk.layout(graph);
	const layoutedNodesById = new Map(
		(layoutedGraph.children ?? []).map(layoutedNode => [layoutedNode.id, layoutedNode]),
	);
	const nodesById = new Map(nodes.map(node => [node.id, node]));
	const getLayoutedRect = (nodeId: string): InfluenceNodeRect | undefined => {
		const layoutedNode = layoutedNodesById.get(nodeId);
		if (!layoutedNode) return;
		return {
			x: layoutedNode.x ?? 0,
			y: layoutedNode.y ?? 0,
			width: layoutedNode.width ?? defaultNodeWidth,
			height: layoutedNode.height ?? defaultNodeHeight,
			shape: getShapeForNodeType(nodesById.get(nodeId)?.type),
		};
	};
	const edgesById = new Map(edges.map(edge => [edge.id, edge]));
	const getEndpointClip = (edgeId: string): EndpointClip | undefined => {
		const edge = edgesById.get(edgeId);
		if (!usePorts || !edge) return;
		const source = getLayoutedRect(edge.source);
		const target = getLayoutedRect(edge.target);
		if (!source || !target) return;
		return { source, target, ...portSides };
	};
	const routeByEdgeId = new Map(
		(layoutedGraph.edges ?? [])
			.map(layoutedEdge => {
				const route = getInfluenceEdgeRoute(layoutedEdge, getEndpointClip(layoutedEdge.id));
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
