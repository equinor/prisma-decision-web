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
import { MouseEvent, useEffect, useRef } from 'react';
import { convertToNodes } from '../../../utils/convertToNodes';
import { CreateIssues } from '../CreateIssue';
import { Issue, useIssuesContext } from '../ProjectPage';
import { ConnectionLine } from './ConnectingLine';
import { CustomEdge } from './CustomEdge';
import { DiagramIssueCard } from './DiagramIssueCard';

const nodeTypes = { issue: DiagramIssueCard };
const edgeTypes = { issue: CustomEdge };

export const DiagramView = () => {
	const { issues, setIssues } = useIssuesContext();
	const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
	const [nodes, setNodes, onNodesChange] = useNodesState(convertToNodes(issues));
	useEffect(() => {
		setNodes(convertToNodes(issues));
	}, [issues]);
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

	const onNodeDragStop = (_: MouseEvent, node: Node) => {
		const issue = node.data.issue as Issue;
		setIssues(issues => {
			return {
				...issues,
				[issue.type]: issues[issue.type].map(x => {
					if (x.id === issue.id) {
						return {
							...x,
							position: {
								x: node.position.x,
								y: node.position.y,
							},
						};
					}
					return x;
				}),
			};
		});
	};

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
					onReconnectStart={onReconnectStart}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					connectionLineComponent={ConnectionLine}
					onConnect={onConnect}
					isValidConnection={isValidConnection}
					onNodesChange={onNodesChange}
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
