import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import {
	addEdge,
	Background,
	BaseEdge,
	Connection,
	ConnectionLineComponentProps,
	ConnectionMode,
	Controls,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	getSmoothStepPath,
	Handle,
	IsValidConnection,
	MarkerType,
	Node,
	NodeProps,
	OnConnect,
	Position,
	ReactFlow,
	reconnectEdge,
	useConnection,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from '@xyflow/react';
import { getCardType } from '../../../utils/getCardType';
import { CreateIssues } from '../CreateIssue';
import { Issue } from '../ProjectPage';

export const DiagramView = () => {
	const [nodes, _, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

	const onConnect: OnConnect = params => {
		setEdges(eds => addEdge(params, eds));
	};

	const onReconnect = (oldEdge: Edge, newConnection: Connection) => {
		setEdges(els => reconnectEdge(oldEdge, newConnection, els));
	};

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

export default function IssueEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	markerEnd,
}: EdgeProps) {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
	});

	const { setEdges } = useReactFlow();

	const handleDelete = () => {
		setEdges(eds => eds.filter(edge => edge.id !== id));
	};

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				className='stroke-primary-resting! stroke-4!'
			/>
			<EdgeLabelRenderer>
				<div
					className='nodrag nopan pointer-events-auto absolute origin-center'
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}
				>
					<Button color='danger' className='p-1!' onClick={handleDelete}>
						<Icon data={delete_to_trash} />
					</Button>
				</div>
			</EdgeLabelRenderer>
		</>
	);
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
const edgeTypes = { issue: IssueEdge };

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
