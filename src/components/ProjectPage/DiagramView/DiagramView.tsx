import {
	addEdge,
	Background,
	Connection,
	ConnectionMode,
	Controls,
	Edge,
	IsValidConnection,
	MarkerType,
	Node,
	OnConnect,
	ReactFlow,
	reconnectEdge,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { MouseEvent, useRef } from 'react';
import { useUpdateIssues } from '../../../hooks/api/useUpdateIssues';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { convertNodesToIssues } from '../../../utils/convertNodesToIssues';
import { convertToNodes } from '../../../utils/convertToNodes';
import { CreateIssues } from '../CreateIssueForm';
import { ConnectionLine } from './ConnectingLine';
import { CustomEdge } from './CustomEdge';
import { DiagramIssueCard } from './DiagramIssueCard';

const nodeTypes = { issue: DiagramIssueCard };
const edgeTypes = { issue: CustomEdge };

export const DiagramView = () => {
	const issues = useSelectedProjectIssues();
	const { mutate: updateIssue } = useUpdateIssues();
	const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
	const [_nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
	const draggingEdge = useRef<Edge | null>(null);

	const onConnect: OnConnect = params => {
		setEdges(eds => addEdge(params, eds));
	};

	const onReconnect = (oldEdge: Edge, newConnection: Connection) => {
		setEdges(els => reconnectEdge(oldEdge, newConnection, els));
	};

	const onReconnectStart = (_: MouseEvent, edge: Edge) => {
		draggingEdge.current = edge;
	};

	const onNodeDragStop = async () => {
		setNodes([]);
		await updateIssue(convertNodesToIssues(_nodes));
	};

	const nodes = _nodes.length > 0 ? _nodes : convertToNodes(issues);

	const isValidConnection: IsValidConnection = (connection: Connection | Edge) => {
		if (connection.source === connection.target) return false;
		const edgeExists = edges.some(edge => {
			if (draggingEdge.current && edge.id === draggingEdge.current.id) return false;
			return (
				(edge.source === connection.source && edge.target === connection.target) ||
				(edge.source === connection.target && edge.target === connection.source)
			);
		});
		return !edgeExists;
	};

	return (
		<>
			<CreateIssues />
			<div
				className='bg-background-light shadow-tile flex h-[800px] w-full flex-col items-start
        	    gap-6 rounded-sm'
			>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					defaultEdgeOptions={{
						type: 'issue',
						markerEnd: {
							type: MarkerType.ArrowClosed,
							color: 'rgba(var(--eds_primary_resting), 1)',
						},
					}}
					connectionMode={ConnectionMode.Loose}
					onReconnect={onReconnect}
					onNodeDragStop={onNodeDragStop}
					onNodeDragStart={() => {
						setNodes(convertToNodes(issues));
					}}
					onReconnectStart={onReconnectStart}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					connectionLineComponent={ConnectionLine}
					onConnect={onConnect}
					isValidConnection={isValidConnection}
					onNodesChange={changes => {
						if (_nodes.length === 0) return;
						onNodesChange(changes);
					}}
					onEdgesChange={onEdgesChange}
					proOptions={{ hideAttribution: true }}
					fitView
				>
					<Background />
					<Controls
						className='[&_button]:bg-primary-resting! [&_button]:hover:bg-primary-hover!
                        [&_button_svg]:text-text-white! gap-1 [&_button]:rounded-sm [&_button]:border-0!'
					/>
				</ReactFlow>
			</div>
		</>
	);
};
