import dagre from '@dagrejs/dagre';
import { Edge, Node } from '@xyflow/react';

const nodeWidth = 254;
const nodeHeight = 140;

export const getDecisionTreeLayout = (nodes: Node[], edges: Edge[], direction = 'LR') => {
	const dagreGraph = new dagre.graphlib.Graph()
		.setDefaultEdgeLabel(() => ({}))
		.setGraph({ rankdir: direction, edgesep: 150, nodesep: 40, ranksep: 300 });

	nodes.forEach(node => {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	});

	edges.forEach(edge => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph, {
		disableOptimalOrderHeuristic: true,
	});

	const newNodes = nodes.map(node => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const newNode = {
			...node,
			position: {
				x: nodeWithPosition.x - nodeWidth / 2,
				y: nodeWithPosition.y - nodeHeight / 2,
			},
		};

		return newNode;
	});

	const newEdges = edges.map(edge => {
		return {
			...edge,
			targetHandle: 'left',
			sourceHandle: 'right',
		};
	});

	return { nodes: newNodes, edges: newEdges };
};
