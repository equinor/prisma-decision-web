import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edge } from '@xyflow/react';
import { useMemo, useRef } from 'react';
import { ReactFlowInfluenceNode } from '../types';
import { convertToInfluenceEdges } from '../utils/convertToInfluenceEdges';
import { getInfluenceDiagramLayout } from '../utils/getInfluenceDiagramLayout';
import { useSelectedProjectEdges } from './useSelectedProjectEdges';
import { useSelectedProjectInfluenceNodes } from './useSelectedProjectInfluenceNodes';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';

const defaultNodes = [] as ReactFlowInfluenceNode[];
const defaultEdges = [] as Edge[];

export const useInfluenceDiagramLayout = () => {
	const issues = useSelectedProjectIssues();
	const { nodes, isFetching: isFetchingNodes } = useSelectedProjectInfluenceNodes();
	const { edges, isFetching: isFetchingEdges } = useSelectedProjectEdges();
	const queryClient = useQueryClient();
	const latestLayoutNodesRef = useRef<ReactFlowInfluenceNode[]>(defaultNodes);

	const filteredNodes = useMemo(() => {
		const filteredIssues = issues.filter(issue => {
			const inOrOnBoundary = issue.boundary === 'in' || issue.boundary === 'on';
			if (issue.type === 'Decision') return inOrOnBoundary && issue.decision.type === 'Focus';
			if (issue.type === 'Uncertainty') return inOrOnBoundary && issue.uncertainty.is_key;
			if (issue.type === 'Utility') return inOrOnBoundary;
			return false;
		});
		return nodes.filter(node => filteredIssues.some(issue => issue.id === node.data.issue_id));
	}, [issues, nodes]);

	const {
		data: { positionedNodes, positionedEdges } = {
			positionedNodes: defaultNodes,
			positionedEdges: defaultEdges,
		},
	} = useQuery({
		queryKey: ['influenceDiagramLayout', { nodes: filteredNodes, edges }],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const measuredNodes = mergeMeasuredNodes(filteredNodes, latestLayoutNodesRef.current);
			const layout = await getInfluenceDiagramLayout(
				measuredNodes,
				convertToInfluenceEdges(edges, measuredNodes),
			);

			latestLayoutNodesRef.current = layout.positionedNodes;
			return layout;
		},
		enabled:
			filteredNodes.length > 0 && edges.length > 0 && !isFetchingNodes && !isFetchingEdges,
	});

	const updateInfluencceDiagram = (
		cb: (
			positionedNodes: ReactFlowInfluenceNode[],
			positionedEdges: Edge[],
		) => { positionedNodes: ReactFlowInfluenceNode[]; positionedEdges: Edge[] },
	) => {
		const nextLayout = cb(positionedNodes, positionedEdges);
		latestLayoutNodesRef.current = nextLayout.positionedNodes;

		queryClient.setQueryData(
			['influenceDiagramLayout', { nodes: filteredNodes, edges }],
			nextLayout,
		);
	};

	return {
		positionedNodes,
		positionedEdges,
		updateInfluencceDiagram,
	};
};

const mergeMeasuredNodes = (
	nodes: ReactFlowInfluenceNode[],
	previousNodes: ReactFlowInfluenceNode[],
) => {
	if (previousNodes.length === 0) return nodes;

	const previousNodesById = new Map(previousNodes.map(node => [node.id, node]));

	return nodes.map(node => {
		const previousNode = previousNodesById.get(node.id);
		if (!previousNode?.measured) return node;

		return {
			...node,
			measured: previousNode.measured,
			width: previousNode.width,
			height: previousNode.height,
		};
	});
};
