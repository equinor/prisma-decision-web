import { Edge as FlowEdge } from '@xyflow/react';
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { ReactFlowInfluenceNode } from '../types';
import { buildRoundedPolylinePath } from './buildRoundedPolylinePath';
import { InfluenceEdgeData, InfluenceEdgePoint } from './convertToInfluenceEdges';
import { getEdgeLabelPosition } from './getEdgeLabelPosition';

const elk = new ELK();

const defaultNodeWidth = 350;
const defaultNodeHeight = 140;

const getInfluenceEdgeRoute = (edge: ElkExtendedEdge) => {
	const section = edge.sections?.[0];
	if (!section) return;

	const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].filter(
		point => !!point,
	);

	if (points.length < 2) return;
	const pathPoints = points.map(point => [point.x, point.y] as InfluenceEdgePoint);
	const { labelX, labelY } = getEdgeLabelPosition(pathPoints);

	const path = buildRoundedPolylinePath(pathPoints);
	return {
		path,
		points: pathPoints,
		labelX,
		labelY,
	};
};

export const getInfluenceDiagramLayout = async (
	nodes: ReactFlowInfluenceNode[],
	edges: FlowEdge<InfluenceEdgeData>[],
	layoutOptions: LayoutOptions,
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
			...layoutOptions,
			'elk.algorithm.graphviz': 'dot',
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
