import {
	Connection,
	Edge as FlowEdge,
	IsValidConnection,
	Node,
	NodeChange,
	NodeDimensionChange,
	OnConnect,
	OnReconnect,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useUpdateEdge } from '../../../hooks/api/useUpdateEdge';
import { useUpdateIssuesOptimistic } from '../../../hooks/api/useUpdateIssues';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { useSelectedScenario } from '../../../hooks/useSelectedScenario';
import { convertNodesToIssues } from '../../../utils/convertNodesToIssues';
import { convertToInfluenceEdges } from '../../../utils/convertToInfluenceEdges';
import { convertToInfluenceNodes } from '../../../utils/convertToInfluenceNodes';
import { useGetDecisionTree } from '../../../hooks/api/useGetDecisionTree';
import { AxiosError } from 'axios';

export const useInfluenceDiagram = (
	handleErrorMessage: (msg: string) => void,
	handleShowDecisionTree: (show: boolean) => void,
	nodeProps?: { handleClassName?: string }, // Add this third parameter
) => {
	const issues = useSelectedProjectIssues();
	const edges = useSelectedProjectEdges();
	const selectedScenario = useSelectedScenario();
	const { mutate: updateIssue } = useUpdateIssuesOptimistic();
	const { mutate: createEdge } = useCreateEdge();
	const { mutate: updateEdge } = useUpdateEdge();
	const [customNodeSizes, setCustomNodeSizes] = useState<
		Record<string, { width: number; height: number }>
	>({});
	const [localNodes, setLocalNodes, onLocalNodesChange] = useNodesState([] as Node[]);
	const [localEdges, setEdges, onEdgesChange] = useEdgesState([] as FlowEdge[]);
	const draggingEdge = useRef<FlowEdge | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const { error, isError, refetch } = useGetDecisionTree(selectedScenario?.id);

	useEffect(() => {
		if (isError && error) {
			const err = error as AxiosError;
			if (
				err.response?.data &&
				typeof err.response.data === 'object' &&
				'detail' in err.response.data
			) {
				handleErrorMessage(err.response.data.detail as string);
				handleShowDecisionTree(false);
			} else {
				handleErrorMessage(err.message);
				handleShowDecisionTree(false);
			}
		}
	}, [isError, error]);

	useEffect(() => {
		setLocalNodes(
			convertToInfluenceNodes(issues, nodeProps?.handleClassName).map(node => ({
				...node,
				height: customNodeSizes[node.id]?.height || node.height,
				width: customNodeSizes[node.id]?.width || node.width,
			})),
		);
		refetch();
	}, [issues]);

	useEffect(() => {
		setEdges(convertToInfluenceEdges(edges, convertToInfluenceNodes(issues)));
		refetch();
	}, [edges, issues]);

	const onConnect: OnConnect = params => {
		if (!selectedScenario) return;
		createEdge({
			head_id: params.target,
			tail_id: params.source,
			scenario_id: selectedScenario.id,
			id: crypto.randomUUID(),
		});
		refetch();
	};

	const onReconnect: OnReconnect = (oldEdge, newConnection) => {
		if (!selectedScenario) return;
		updateEdge({
			id: oldEdge.id,
			tail_id: newConnection.source,
			head_id: newConnection.target,
			scenario_id: selectedScenario.id,
		});
		refetch();
	};

	const onReconnectStart = (_: MouseEvent, edge: FlowEdge) => {
		draggingEdge.current = edge;
	};

	const onNodeDragStop = async () => {
		await updateIssue(convertNodesToIssues(localNodes));
	};

	const onNodeResize = (changes: NodeDimensionChange[]) => {
		setCustomNodeSizes(prev => {
			const updated = { ...prev };
			changes.forEach(change => {
				if (change.id && change.dimensions) {
					updated[change.id] = {
						width: change.dimensions.width,
						height: change.dimensions.height,
					};
				}
			});
			return updated;
		});
	};

	const onClickSelectionMode = () => {
		setIsSelecting(true);
	};

	const onClickPanMode = () => {
		setIsSelecting(false);
	};

	const onNodesChange = (changes: NodeChange[]) => {
		const resizeChange = changes
			.filter(change => change.type === 'dimensions')
			.filter(change => change.resizing);
		if (resizeChange.length > 0) onNodeResize(resizeChange);
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
	};
};
