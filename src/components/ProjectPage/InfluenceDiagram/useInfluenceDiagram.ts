import {
	applyEdgeChanges,
	applyNodeChanges,
	Connection,
	EdgeChange,
	EdgeMouseHandler,
	Edge as FlowEdge,
	IsValidConnection,
	NodeChange,
	OnConnect,
	OnReconnect,
} from '@xyflow/react';
import { MouseEvent, useRef, useState } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useUpdateEdge } from '../../../hooks/api/useUpdateEdge';
import { useInfluenceDiagramLayout } from '../../../hooks/useInfluenceDiagramLayout';
import { useInfluenceDiagramSettings } from '../../../hooks/useInfluenceDiagramSettings';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../../../types';
import { getInfluenceDiagramLayout } from '../../../utils/getInfluenceDiagramLayout';
import { useSelectedProject } from '../ProjectContext';

export const useInfluenceDiagram = () => {
	const issues = useSelectedProjectIssues();
	const { mutate: createEdge } = useCreateEdge();
	const { mutate: updateEdge } = useUpdateEdge();
	const selectedProject = useSelectedProject();
	const [layoutOptions] = useInfluenceDiagramSettings();
	const { positionedNodes, positionedEdges, updateInfluenceDiagram } =
		useInfluenceDiagramLayout();

	const draggingEdge = useRef<FlowEdge | null>(null);
	const hoveredEdgeId = useRef<string | null>(null);
	const [isSelecting] = useState(false);

	const updateHoveredEdge = (edgeId: string | null) => {
		hoveredEdgeId.current = edgeId;
		updateInfluenceDiagram((positionedNodes, positionedEdges) => {
			return {
				positionedNodes,
				positionedEdges: positionedEdges.map(edge => ({
					...edge,
					data: {
						...edge.data,
						hovered: edge.id === edgeId,
					},
				})),
			};
		});
	};

	const sourceIsUtility = (sourceId: string) => {
		const sourceNode = positionedNodes.find(node => node.id === sourceId);
		const sourceIssue = issues.find(issue => issue.id === sourceNode?.data.issue_id);
		return sourceIssue?.type === 'Utility';
	};

	const onConnect: OnConnect = async params => {
		if (sourceIsUtility(params.source)) return;
		const newEdge = {
			head_id: params.target,
			tail_id: params.source,
			project_id: selectedProject.id,
			id: crypto.randomUUID(),
		};
		createEdge(newEdge);
	};

	const onReconnect: OnReconnect = async (oldEdge, newConnection) => {
		if (sourceIsUtility(newConnection.source)) return;
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

	const onEdgeMouseEnter: EdgeMouseHandler = (_, edge) => {
		if (hoveredEdgeId.current === edge.id) return;
		updateHoveredEdge(edge.id);
	};

	const onEdgeMouseLeave: EdgeMouseHandler = (_, edge) => {
		if (hoveredEdgeId.current !== edge.id) return;
		updateHoveredEdge(null);
	};

	const onEdgesChange = async (changes: EdgeChange[]) => {
		const nextEdges = applyEdgeChanges(changes, positionedEdges);
		const { positionedNodes: newNodes, positionedEdges: newEdges } =
			await getInfluenceDiagramLayout(positionedNodes, nextEdges, layoutOptions);
		updateInfluenceDiagram(() => {
			return {
				positionedNodes: newNodes,
				positionedEdges: newEdges,
			};
		});
	};

	const onNodesChange = async (changes: NodeChange<ReactFlowInfluenceNode>[]) => {
		const nextNodes = applyNodeChanges(changes, positionedNodes);
		const hasLayoutAffectingChange = changes.some(change => change.type !== 'select');

		if (!hasLayoutAffectingChange) {
			updateInfluenceDiagram(() => {
				return {
					positionedNodes: nextNodes,
					positionedEdges,
				};
			});
			return;
		}

		const { positionedNodes: newNodes, positionedEdges: newEdges } =
			await getInfluenceDiagramLayout(nextNodes, positionedEdges, layoutOptions);
		updateInfluenceDiagram(() => {
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
		onEdgesChange,
		isValidConnection,
		isSelecting,
		onEdgeMouseEnter,
		onEdgeMouseLeave,
	};
};
