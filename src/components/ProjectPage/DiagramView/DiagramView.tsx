import {
	addEdge,
	applyNodeChanges,
	Background,
	BaseEdge,
	Connection,
	ConnectionLineComponentProps,
	ConnectionMode,
	Controls,
	Edge,
	EdgeProps,
	getStraightPath,
	Handle,
	IsValidConnection,
	MarkerType,
	Node,
	NodeChange,
	NodeProps,
	OnConnect,
	Position,
	ReactFlow,
	reconnectEdge,
	useConnection,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { getCardType } from '../../../utils/getCardType';
import { CreateProjectIssues } from '../CreateProjectIssue';
import { Issue } from '../ProjectPage';

export const DiagramView = () => {
	const [nodes, setNodes] = useNodesState(initialNodes);
	const [edges, setEdges] = useEdgesState([] as Edge[]);
	const onConnect: OnConnect = params => {
		setEdges(eds => addEdge(params, eds));
	};

	const onReconnect = (oldEdge: Edge, newConnection: Connection) => {
		setEdges(els => reconnectEdge(oldEdge, newConnection, els));
	};
	const onNodesChange = (changes: NodeChange[]) =>
		setNodes(nds => applyNodeChanges(changes, nds));

	const isValidConnection: IsValidConnection = (connection: Connection | Edge) => {
		if (connection.source === connection.target) return false;
		const edgeExists = edges.some(
			edge =>
				(edge.source === connection.source && edge.target === connection.target) ||
				(edge.source === connection.target && edge.target === connection.source),
		);
		return !edgeExists;
	};

	return (
		<>
			<CreateProjectIssues />
			<div className='h-[800px]'>
				<ReactFlow
					className='outline-background-medium shadow-tile rounded-sm outline-1'
					nodes={nodes}
					edges={edges}
					defaultEdgeOptions={{
						style: {
							strokeWidth: 4,
							stroke: 'rgba(var(--eds_primary_resting), 1)',
						},
						type: 'step',
						animated: false,
						markerEnd: {
							type: MarkerType.ArrowClosed,
							color: 'rgba(var(--eds_primary_resting), 1)',
						},
					}}
					connectionMode={ConnectionMode.Loose}
					onReconnect={onReconnect}
					nodeTypes={nodeTypes}
					connectionLineComponent={ConnectionLine}
					onConnect={onConnect}
					isValidConnection={isValidConnection}
					onNodesChange={onNodesChange}
					proOptions={{ hideAttribution: true }}
					fitView
				>
					<Background />
					<Controls className='[&_button]:bg-primary-resting! [&_button]:hover:bg-primary-hover! [&_button_svg]:text-text-white! gap-1 [&_button]:rounded-sm [&_button]:border-0!' />
				</ReactFlow>
			</div>
		</>
	);
};

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY }: EdgeProps) {
	const [edgePath] = getStraightPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	return <BaseEdge id={id} path={edgePath} className='fill-red-800' />;
}

const FlowIssueContainer = ({ data }: NodeProps<Node<{ issue: Issue }>>) => {
	const IssueCard = getCardType(data.issue.type);
	return (
		<div>
			<Handle
				type='source'
				position={Position.Top}
				id='a'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<IssueCard issue={data.issue} index={-1} />
			<Handle
				type='source'
				position={Position.Bottom}
				id='b'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Left}
				id='c'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Right}
				id='d'
				className='bg-primary-resting! h-3! w-3!'
			/>
		</div>
	);
};

const defaultIssues: Issue[] = [
	{
		type: 'decision',
		name: '2424rfevwef',
		id: crypto.randomUUID(),
		description: '',
		position: { x: -4, y: 208 },
	},
	{
		type: 'decision',
		name: 'Decision 2',
		id: crypto.randomUUID(),
		description: '',
		position: { x: 953, y: 182 },
	},
	{
		type: 'value',
		name: 'e5t35bt3tb5',
		id: crypto.randomUUID(),
		description: '',
		position: { x: 768, y: -100 },
	},

	{
		type: 'uncertainty',
		name: 'hrt h4tb4hbh4t',
		id: crypto.randomUUID(),
		position: { x: 500, y: 171 },
		description: '',
	},
];

const nodeTypes = { issue: FlowIssueContainer };

const initialNodes: Node[] = defaultIssues.map((issue, index) => ({
	id: issue.id,
	position: issue.position || { x: index * 100, y: index * 100 },
	type: 'issue',
	data: {
		label: issue.name,
		issue,
	},
}));

const ConnectionLine = ({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) => {
	const { fromHandle } = useConnection();
	if (!fromHandle?.id) return null;
	return (
		<g>
			<path
				fill='none'
				stroke={fromHandle.id}
				strokeWidth={1.5}
				className='animated stroke-primary-resting stroke-4'
				d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
			/>
			<circle cx={toX} cy={toY} fill='#fff' r={3} stroke={fromHandle.id} strokeWidth={1.5} />
		</g>
	);
};
