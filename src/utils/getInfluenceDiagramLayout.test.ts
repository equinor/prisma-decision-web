import { Edge, InternalNode, Position } from '@xyflow/react';
import { expect, test } from 'vitest';
import { getShapeEdgeRoute } from '../components/ProjectPage/InfluenceDiagram/Shape/getShapeEdgeRoute';
import { ReactFlowInfluenceNode } from '../types';
import { getInfluenceDiagramLayout } from './getInfluenceDiagramLayout';
import { InfluenceEdgeData } from './convertToInfluenceEdges';

const layoutOptions = {
	'elk.direction': 'RIGHT',
	'elk.spacing.edgeNode': '70',
	'elk.spacing.nodeNode': '100',
	'elk.layered.spacing.edgeNodeBetweenLayers': '100',
	'elk.layered.spacing.nodeNodeBetweenLayers': '250',
};

const node = (
	id: string,
	type: 'decision' | 'uncertainty' | 'utility',
	width: number,
	height: number,
) =>
	({
		id,
		type,
		data: { issue_id: id },
		position: { x: 0, y: 0 },
		measured: { width, height },
		width,
		height,
	}) as ReactFlowInfluenceNode;

test('off-center incoming routes touch the painted Utility diamond', async () => {
	const utilityWidth = 240;
	const utilityHeight = 88;
	const nodes = [
		node('source-a', 'uncertainty', 240, 72),
		node('source-b', 'uncertainty', 240, 72),
		node('target', 'utility', utilityWidth, utilityHeight),
	];
	const edges: Edge<InfluenceEdgeData>[] = [
		{ id: 'edge-a', source: 'source-a', target: 'target' },
		{ id: 'edge-b', source: 'source-b', target: 'target' },
	];

	const { positionedNodes, positionedEdges } = await getInfluenceDiagramLayout(
		nodes,
		edges,
		layoutOptions,
	);
	const target = positionedNodes.find(candidate => candidate.id === 'target');
	if (!target) throw new Error('Missing target node');
	const internalTarget: InternalNode = {
		...target,
		measured: { width: utilityWidth, height: utilityHeight },
		internals: {
			positionAbsolute: target.position,
			z: 0,
			userNode: target,
			handleBounds: {
				source: [],
				target: [
					{
						id: 'node-target',
						nodeId: target.id,
						type: 'target',
						position: Position.Left,
						x: 0,
						y: 0,
						width: utilityWidth,
						height: utilityHeight,
					},
				],
			},
		},
	};
	const centerY = target.position.y + utilityHeight / 2;
	const endpoints = positionedEdges.map(edge =>
		getShapeEdgeRoute(edge.data?.route, undefined, internalTarget)?.points.at(-1),
	);
	expect(endpoints.every(point => point !== undefined)).toBe(true);
	expect(endpoints.some(point => Math.abs(point![1] - centerY) > 0.1)).toBe(true);

	for (const point of endpoints) {
		if (!point) throw new Error('Missing edge endpoint');
		const verticalOffset = Math.abs((point[1] - centerY) / (utilityHeight / 2));
		const expectedX = target.position.x + (utilityWidth / 2) * verticalOffset;
		expect(point[0]).toBeCloseTo(expectedX, 4);
	}
});
