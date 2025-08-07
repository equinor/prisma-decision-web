import {
	Connection,
	Edge as FlowEdge,
	IsValidConnection,
	Node,
	OnConnect,
	OnReconnect,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { MouseEvent, useRef } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useUpdateEdge } from '../../../hooks/api/useUpdateEdge';
import { useUpdateIssuesOptimistic } from '../../../hooks/api/useUpdateIssues';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { convertNodesToIssues } from '../../../utils/convertNodesToIssues';
import { convertToNodes } from '../../../utils/convertToNodes';
import { Edge } from '../../../validators';

export const useDiagramView = () => {
	const issues = useSelectedProjectIssues();
	const edges = useSelectedProjectEdges();
	const selectedScenario = useSelectedProject();
	const { mutate: updateIssue } = useUpdateIssuesOptimistic();
	const { mutate: createEdge } = useCreateEdge();
	const { mutate: updateEdge } = useUpdateEdge();
	const [localNodes, setLocalNodes, onLocalNodesChange] = useNodesState([] as Node[]);
	const [localEdges, setEdges, onEdgesChange] = useEdgesState([] as FlowEdge[]);
	const draggingEdge = useRef<FlowEdge | null>(null);
	const activeNodes = localNodes.length > 0 ? localNodes : convertToNodes(issues);
	const activeEdges = localEdges.length > 0 ? localEdges : convertToEdges(edges);

	const onConnect: OnConnect = params => {
		if (!selectedScenario) return;
		createEdge({
			head_id: params.target,
			tail_id: params.source,
			scenario_id: selectedScenario.scenarios[0].id,
			id: crypto.randomUUID(),
		});
		setEdges([]);
	};

	const onReconnect: OnReconnect = (oldEdge, newConnection) => {
		if (!selectedScenario) return;
		updateEdge({
			id: oldEdge.id,
			tail_id: newConnection.source,
			head_id: newConnection.target,
			scenario_id: selectedScenario.scenarios[0].id,
		});
		setEdges([]);
	};

	const onReconnectStart = (_: MouseEvent, edge: FlowEdge) => {
		draggingEdge.current = edge;
	};

	const onNodeDragStop = async () => {
		await updateIssue(convertNodesToIssues(localNodes));
		setLocalNodes([]);
	};

	const isValidConnection: IsValidConnection = (connection: Connection | FlowEdge) => {
		if (connection.source === connection.target) return false;
		const edgeExists = activeEdges.some(edge => {
			if (draggingEdge.current && edge.id === draggingEdge.current.id) return false;
			return (
				(edge.source === connection.source && edge.target === connection.target) ||
				(edge.source === connection.target && edge.target === connection.source)
			);
		});
		return !edgeExists;
	};
	return {
		nodes: activeNodes,
		edges: activeEdges,
		_nodes: localNodes,
		issues,
		onConnect,
		onReconnect,
		onReconnectStart,
		onNodeDragStop,
		onNodesChange: onLocalNodesChange,
		onEdgesChange,
		isValidConnection,
		setEdges,
		setNodes: setLocalNodes,
	};
};

const convertToEdges = (edges: Edge[]) => {
	return edges.map(edge => ({
		...edge,
		id: edge.id,
		source: edge.tail_id,
		target: edge.head_id,
	}));
};
