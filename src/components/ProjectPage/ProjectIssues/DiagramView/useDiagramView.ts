import {
	Connection,
	Edge as FlowEdge,
	IsValidConnection,
	Node,
	NodeChange,
	OnConnect,
	OnReconnect,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { MouseEvent, useEffect, useRef } from 'react';
import { useCreateEdge } from '../../../../hooks/api/useCreateEdge';
import { useUpdateEdge } from '../../../../hooks/api/useUpdateEdge';
import { useUpdateIssuesOptimistic } from '../../../../hooks/api/useUpdateIssues';
import { useSelectedProjectEdges } from '../../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { useSelectedScenario } from '../../../../hooks/useSelectedScenario';
import { convertNodesToIssues } from '../../../../utils/convertNodesToIssues';
import { convertToEdges } from '../../../../utils/convertToEdges';
import { convertToNodes } from '../../../../utils/convertToNodes';

export const useDiagramView = () => {
	const issues = useSelectedProjectIssues();
	const edges = useSelectedProjectEdges();
	const selectedScenario = useSelectedScenario();
	const { mutate: updateIssue } = useUpdateIssuesOptimistic();
	const { mutate: createEdge } = useCreateEdge();
	const { mutate: updateEdge } = useUpdateEdge();
	const [localNodes, setLocalNodes, onLocalNodesChange] = useNodesState([] as Node[]);
	const [localEdges, setEdges, onEdgesChange] = useEdgesState([] as FlowEdge[]);
	const draggingEdge = useRef<FlowEdge | null>(null);

	useEffect(() => {
		setLocalNodes(convertToNodes(issues));
	}, [issues]);

	useEffect(() => {
		setEdges(convertToEdges(edges, localNodes));
	}, [edges, localNodes]);

	const onConnect: OnConnect = params => {
		if (!selectedScenario) return;
		createEdge({
			head_id: params.target,
			tail_id: params.source,
			scenario_id: selectedScenario.id,
			id: crypto.randomUUID(),
		});
	};

	const onReconnect: OnReconnect = (oldEdge, newConnection) => {
		if (!selectedScenario) return;
		updateEdge({
			id: oldEdge.id,
			tail_id: newConnection.target,
			head_id: newConnection.source,
			scenario_id: selectedScenario.id,
		});
	};

	const onReconnectStart = (_: MouseEvent, edge: FlowEdge) => {
		draggingEdge.current = edge;
	};

	const onNodeDragStop = async () => {
		await updateIssue(convertNodesToIssues(localNodes));
	};

	const onNodesChange = (changes: NodeChange[]) => {
		onLocalNodesChange(changes);
		const updatedEdges = convertToEdges(edges, localNodes);
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
	};
};
