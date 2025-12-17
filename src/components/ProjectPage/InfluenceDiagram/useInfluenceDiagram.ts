import {
	Connection,
	Edge as FlowEdge,
	IsValidConnection,
	NodeChange,
	OnConnect,
	OnReconnect,
	EdgeMouseHandler,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useUpdateEdge } from '../../../hooks/api/useUpdateEdge';
import { useUpdateInfluenceNodesOptimistic } from '../../../hooks/api/useUpdateInfluenceNodes';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectInfluenceNodes } from '../../../hooks/useSelectedProjectInfluenceNodes';
import { ReactFlowInfluenceNode } from '../../../types';
import { convertNodeToInfluenceNode } from '../../../utils/convertNodeToInfluenceNode';
import { convertToInfluenceEdges } from '../../../utils/convertToInfluenceEdges';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const useInfluenceDiagram = () => {
	const nodes = useSelectedProjectInfluenceNodes();
	const issues = useSelectedProjectIssues();
	const edges = useSelectedProjectEdges();
	const selectedProject = useSelectedProject();
	const { mutate: updateNodes } = useUpdateInfluenceNodesOptimistic();
	const { mutate: createEdge } = useCreateEdge();
	const { mutate: updateEdge } = useUpdateEdge();
	const [localNodes, setLocalNodes, onLocalNodesChange] = useNodesState(
		[] as ReactFlowInfluenceNode[],
	);
	const [localEdges, setEdges, onEdgesChange] = useEdgesState([] as FlowEdge[]);
	const draggingEdge = useRef<FlowEdge | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);

	useEffect(() => {
		setLocalNodes(nodes);
	}, [nodes]);

	useEffect(() => {
		setEdges(convertToInfluenceEdges(edges, nodes));
	}, [edges, nodes]);

	const sourceAndTargetAreUtility = (sourceId: string, targetId: string) => {
		const sourceNode = localNodes.find(node => node.id === sourceId);
		const targetNode = localNodes.find(node => node.id === targetId);
		const sourceIssue = issues.find(issue => issue.id === sourceNode?.data.node.issue_id);
		const targetIssue = issues.find(issue => issue.id === targetNode?.data.node.issue_id);
		return sourceIssue?.type === 'Utility' && targetIssue?.type === 'Utility';
	};

	const onConnect: OnConnect = params => {
		if (sourceAndTargetAreUtility(params.source, params.target)) return;
		if (!selectedProject) return;
		createEdge({
			head_id: params.target,
			tail_id: params.source,
			project_id: selectedProject.id,
			id: crypto.randomUUID(),
		});
	};

	const onReconnect: OnReconnect = (oldEdge, newConnection) => {
		if (sourceAndTargetAreUtility(newConnection.source, newConnection.target)) return;
		if (!selectedProject) return;
		updateEdge({
			id: oldEdge.id,
			tail_id: newConnection.source,
			head_id: newConnection.target,
			project_id: selectedProject.id,
		});
	};

	const onReconnectStart = (_: MouseEvent, edge: FlowEdge) => {
		draggingEdge.current = edge;
	};

	const onNodeDragStop = async () => {
		await updateNodes(convertNodeToInfluenceNode(localNodes));
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
		onLocalNodesChange(changes);
		const updatedEdges = convertToInfluenceEdges(edges, localNodes);
		setEdges(updatedEdges);
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
		onNodeDragStop,
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
