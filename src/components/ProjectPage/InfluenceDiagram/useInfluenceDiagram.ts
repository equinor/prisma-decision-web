import {
	applyNodeChanges,
	Connection,
	EdgeMouseHandler,
	Edge as FlowEdge,
	IsValidConnection,
	NodeChange,
	OnConnect,
	OnReconnect,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useUpdateEdge } from '../../../hooks/api/useUpdateEdge';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectInfluenceNodes } from '../../../hooks/useSelectedProjectInfluenceNodes';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../../../types';
import { convertToInfluenceEdges, InfluenceEdgeData } from '../../../utils/convertToInfluenceEdges';
import { getInfluenceDiagramLayout } from '../../../utils/getInfluenceDiagramLayout';
import { Edge } from '../../../validators';

export const useInfluenceDiagram = () => {
	const issues = useSelectedProjectIssues();
	const filteredIssues = useMemo(
		() =>
			issues.filter(issue => {
				const inOrOnBoundary = issue.boundary === 'in' || issue.boundary === 'on';
				if (issue.type === 'Decision')
					return inOrOnBoundary && issue.decision.type === 'Focus';
				if (issue.type === 'Uncertainty') return inOrOnBoundary && issue.uncertainty.is_key;
				if (issue.type === 'Utility') return inOrOnBoundary;
				return false;
			}),
		[issues],
	);
	const nodes = useSelectedProjectInfluenceNodes();
	const filteredNodes = useMemo(() => {
		return nodes.filter(node => filteredIssues.some(issue => issue.id === node.data.issue_id));
	}, [nodes, filteredIssues]);
	const edges = useSelectedProjectEdges();
	const selectedProject = useSelectedProject();
	const { mutate: createEdge } = useCreateEdge();
	const { mutate: updateEdge } = useUpdateEdge();
	const [localNodes, setLocalNodes] = useNodesState([] as ReactFlowInfluenceNode[]);
	const [localEdges, setEdges, onEdgesChange] = useEdgesState(
		[] as FlowEdge<InfluenceEdgeData>[],
	);
	const draggingEdge = useRef<FlowEdge | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const runLayout = async (nodesToLayout: ReactFlowInfluenceNode[], edgesToLayout: Edge[]) => {
		const nextEdges = convertToInfluenceEdges(edgesToLayout, nodesToLayout);
		if (nodesToLayout.length < 2) {
			setLocalNodes(nodesToLayout);
			setEdges(nextEdges);
			return;
		}

		const { nodes: layoutedNodes, edges: layoutedEdges } = await getInfluenceDiagramLayout(
			nodesToLayout,
			nextEdges,
		);

		setLocalNodes(layoutedNodes);
		setEdges(layoutedEdges);
	};

	useEffect(() => {
		runLayout(filteredNodes, edges);
	}, [filteredNodes, edges]);

	const sourceAndTargetAreUtility = (sourceId: string, targetId: string) => {
		const sourceNode = localNodes.find(node => node.id === sourceId);
		const targetNode = localNodes.find(node => node.id === targetId);
		const sourceIssue = filteredIssues.find(issue => issue.id === sourceNode?.data.issue_id);
		const targetIssue = filteredIssues.find(issue => issue.id === targetNode?.data.issue_id);
		return sourceIssue?.type === 'Utility' && targetIssue?.type === 'Utility';
	};

	const onConnect: OnConnect = params => {
		if (sourceAndTargetAreUtility(params.source, params.target)) return;
		if (!selectedProject) return;
		const newEdge = {
			head_id: params.target,
			tail_id: params.source,
			project_id: selectedProject.id,
			id: crypto.randomUUID(),
		};

		createEdge(newEdge);
		runLayout(localNodes, [...edges, newEdge]);
	};

	const onReconnect: OnReconnect = (oldEdge, newConnection) => {
		if (sourceAndTargetAreUtility(newConnection.source, newConnection.target)) return;
		if (!selectedProject) return;
		const updatedEdge = {
			id: oldEdge.id,
			tail_id: newConnection.source,
			head_id: newConnection.target,
			project_id: selectedProject.id,
		};

		updateEdge(updatedEdge);
		runLayout(
			localNodes,
			edges.map(edge => (edge.id === oldEdge.id ? updatedEdge : edge)),
		);
	};

	const onReconnectStart = (_: MouseEvent, edge: FlowEdge) => {
		draggingEdge.current = edge;
	};

	const onClickSelectionMode = () => {
		setIsSelecting(true);
	};

	const onClickPanMode = () => {
		setIsSelecting(false);
	};

	const onEdgeMouseEnter: EdgeMouseHandler = (_, edge) => {
		setEdges(edges => {
			return edges.map(e => {
				if (e.id !== edge.id) return e;
				return {
					...e,
					data: {
						...e.data,
						hovered: true,
					},
				};
			});
		});
	};

	const onEdgeMouseLeave: EdgeMouseHandler = (_, edge) => {
		setEdges(edges => {
			return edges.map(e => {
				if (e.id !== edge.id) return e;
				return {
					...e,
					data: {
						...e.data,
						hovered: false,
					},
				};
			});
		});
	};

	const onNodesChange = (changes: NodeChange<ReactFlowInfluenceNode>[]) => {
		const s = applyNodeChanges(changes, localNodes);
		runLayout(s, edges);
	};

	const isValidConnection: IsValidConnection = (connection: Connection | FlowEdge) => {
		if (connection.source === connection.target) return false;
		const edgeExists = localEdges.some(edge => {
			if (draggingEdge.current && edge.id === draggingEdge.current.id) return false;
			return (
				(edge.source === connection.source && edge.target === connection.target) ||
				(edge.source === connection.target && edge.target === connection.source)
			);
		});
		return !edgeExists;
	};
	return {
		nodes: localNodes,
		edges: localEdges,
		onConnect,
		onReconnect,
		onReconnectStart,
		onNodesChange,
		onEdgesChange,
		isValidConnection,
		setEdges,
		setNodes: setLocalNodes,
		isSelecting,
		onClickSelectionMode,
		onClickPanMode,
		onEdgeMouseEnter,
		onEdgeMouseLeave,
	};
};
