import dagre from '@dagrejs/dagre';
import {
	BaseEdge,
	Handle,
	MarkerType,
	Position,
	ReactFlow,
	type Edge,
	type EdgeProps,
	type Node,
	type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { z } from 'zod';
import {
	buildRoundedPolylinePath,
	type PolylinePoint,
} from '../../../utils/buildRoundedPolylinePath';
import type { issueInformationSchema } from '../../../utils/chatInterview';
import type { ChatDiagram } from '../../../utils/diagramInformation';
import { IssueTypeLabel } from '../Cards/IssueTypeLabel';

type Issue = z.infer<typeof issueInformationSchema>;
type IssueNode = Node<{ issue: Issue }, 'issue'>;
type RoutedEdge = Edge<{ points: PolylinePoint[] }, 'routed'>;

const nodeWidth = 280;
const nodeHeight = 64;

const IssueNodeView = ({ data }: NodeProps<IssueNode>) => (
	<div
		className='flex items-center gap-2 rounded border border-(color:--eds-border-non-interactive-neutral-muted) bg-(--eds-background-surface) px-2'
		style={{ width: nodeWidth, height: nodeHeight }}
	>
		<Handle type='target' position={Position.Left} className='opacity-0' />
		<div className='shrink-0'>
			<IssueTypeLabel type={data.issue.type} />
		</div>
		<span className='line-clamp-2 leading-tight' title={data.issue.name}>
			{data.issue.name}
		</span>
		<Handle type='source' position={Position.Right} className='opacity-0' />
	</div>
);

const nodeTypes = { issue: IssueNodeView };

// Follows the route from the layout, so edges go around nodes instead of behind them.
const RoutedEdgeView = ({ data, markerEnd, style }: EdgeProps<RoutedEdge>) => (
	<BaseEdge
		path={buildRoundedPolylinePath(data?.points ?? [], 16)}
		markerEnd={markerEnd}
		style={style}
	/>
);

const edgeTypes = { routed: RoutedEdgeView };

export const QuickStartDiagram = ({
	issues,
	edges,
	suggested,
}: {
	issues: Issue[];
	edges: ChatDiagram['edges'];
	suggested: boolean;
}) => {
	const graph = new dagre.graphlib.Graph()
		.setDefaultEdgeLabel(() => ({}))
		.setGraph({ rankdir: 'LR', nodesep: 24, ranksep: 80 });
	issues.forEach(issue => graph.setNode(issue.name, { width: nodeWidth, height: nodeHeight }));
	edges.forEach(edge => graph.setEdge(edge.tail_issue_name, edge.head_issue_name));
	dagre.layout(graph);

	const nodes: IssueNode[] = issues.map(issue => {
		const { x, y } = graph.node(issue.name);
		return {
			id: issue.name,
			type: 'issue',
			position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
			data: { issue },
		};
	});
	const color = suggested
		? 'var(--eds-border-non-interactive-accent-emphasis)'
		: 'var(--eds-border-non-interactive-neutral-emphasis)';
	const flowEdges: RoutedEdge[] = edges.map(edge => ({
		id: `${edge.tail_issue_name}->${edge.head_issue_name}`,
		type: 'routed',
		source: edge.tail_issue_name,
		target: edge.head_issue_name,
		data: {
			points: graph
				.edge(edge.tail_issue_name, edge.head_issue_name)
				.points.map((point: { x: number; y: number }): PolylinePoint => [point.x, point.y]),
		},
		markerEnd: { type: MarkerType.ArrowClosed, color },
		style: { stroke: color, strokeWidth: 1.5, strokeDasharray: suggested ? '6 4' : undefined },
	}));

	return (
		<div className='h-80 rounded bg-(--eds-background-canvas)'>
			<ReactFlow
				// Remount so the view fits again when the diagram changes.
				key={JSON.stringify([issues.map(issue => issue.name), edges])}
				nodes={nodes}
				edges={flowEdges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				zoomOnScroll={false}
				preventScrolling={false}
				proOptions={{ hideAttribution: true }}
				fitView
			/>
		</div>
	);
};
