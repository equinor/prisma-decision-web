import {
	applyNodeChanges,
	Connection,
	EdgeMouseHandler,
	Edge as FlowEdge,
	IsValidConnection,
	NodeChange,
	OnConnect,
	OnReconnect,
} from '@xyflow/react';
import { MouseEvent, useRef, useState } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useDeleteEdge } from '../../../hooks/api/useDeleteEdge';
import { useUpdateEdge } from '../../../hooks/api/useUpdateEdge';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../../../types';
import { getInfluenceDiagramLayout } from '../../../utils/getInfluenceDiagramLayout';
import { useInfluenceDiagramLayout } from '../../../hooks/useInfluenceDiagramLayout';

export const useInfluenceDiagram = () => {
	const issues = useSelectedProjectIssues();
	const { mutate: createEdge } = useCreateEdge();
	const { mutate: deleteEdge } = useDeleteEdge();
	const { mutate: updateEdge } = useUpdateEdge();
	const selectedProject = useSelectedProject();
	const { positionedNodes, positionedEdges, updateInfluencceDiagram } =
		useInfluenceDiagramLayout();

	const draggingEdge = useRef<FlowEdge | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);

	const sourceAndTargetAreUtility = (sourceId: string, targetId: string) => {
		const sourceNode = positionedNodes.find(node => node.id === sourceId);
		const targetNode = positionedNodes.find(node => node.id === targetId);
		const sourceIssue = issues.find(issue => issue.id === sourceNode?.data.issue_id);
		const targetIssue = issues.find(issue => issue.id === targetNode?.data.issue_id);
		return sourceIssue?.type === 'Utility' && targetIssue?.type === 'Utility';
	};

	const onDeleteEdges = async (edgesToDelete: FlowEdge[]) => {
		deleteEdge(edgesToDelete[0].id);
	};

	const onConnect: OnConnect = async params => {
		if (sourceAndTargetAreUtility(params.source, params.target)) return;
		if (!selectedProject) return;
		const newEdge = {
			head_id: params.target,
			tail_id: params.source,
			project_id: selectedProject.id,
			id: crypto.randomUUID(),
		};
		createEdge(newEdge);
	};

	const onReconnect: OnReconnect = async (oldEdge, newConnection) => {
		if (sourceAndTargetAreUtility(newConnection.source, newConnection.target)) return;
		if (!selectedProject) return;
		const updatedEdge = {
			id: oldEdge.id,
			tail_id: newConnection.source,
			head_id: newConnection.target,
			project_id: selectedProject.id,
		};

		updateEdge(updatedEdge);
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
		updateInfluencceDiagram((positionedNodes, positionedEdges) => {
			return {
				positionedNodes: positionedNodes,
				positionedEdges: positionedEdges.map(e => {
					return {
						...e,
						data: {
							...e.data,
							hovered: e.id === edge.id,
						},
					};
				}),
			};
		});
	};

	const onEdgeMouseLeave: EdgeMouseHandler = (_, edge) => {
		updateInfluencceDiagram((positionedNodes, positionedEdges) => {
			return {
				positionedNodes: positionedNodes,
				positionedEdges: positionedEdges.map(e => {
					return {
						...e,
						data: {
							...e.data,
							hovered: e.id === edge.id,
						},
					};
				}),
			};
		});
	};

	const onNodesChange = async (changes: NodeChange<ReactFlowInfluenceNode>[]) => {
		const { positionedNodes: newNodes, positionedEdges: newEdges } =
			await getInfluenceDiagramLayout(
				applyNodeChanges(changes, positionedNodes),
				positionedEdges,
			);
		updateInfluencceDiagram(() => {
			return {
				positionedNodes: newNodes,
				positionedEdges: newEdges,
			};
		});
	};
	const isValidConnection: IsValidConnection = (connection: Connection | FlowEdge) => {
		if (connection.source === connection.target) return false;
		const edgeExists = positionedEdges.some(edge => {
			if (draggingEdge.current && edge.id === draggingEdge.current.id) return false;
			return (
				(edge.source === connection.source && edge.target === connection.target) ||
				(edge.source === connection.target && edge.target === connection.source)
			);
		});
		return !edgeExists;
	};
	return {
		nodes: positionedNodes,
		edges: positionedEdges,
		onConnect,
		onReconnect,
		onReconnectStart,
		onNodesChange,
		isValidConnection,
		isSelecting,
		onClickSelectionMode,
		onClickPanMode,
		onEdgeMouseEnter,
		onEdgeMouseLeave,
		onDeleteEdges,
	};
};
