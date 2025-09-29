import { Background, ConnectionMode, Controls, MarkerType, ReactFlow } from '@xyflow/react';
import { ConnectionLine } from './ConnectingLine';
import { CustomEdge } from './CustomEdge';
import { DiagramIssueCard } from './DiagramIssueCard';
import { useInfluenceDiagram } from './useDiagramView';
import { CreateIssues } from '../../ProjectIssues/CreateIssue';
import { ToggleExpandAll } from '../../ProjectIssues/ToggleExpandAll';

const nodeTypes = { issue: DiagramIssueCard };
const edgeTypes = { issue: CustomEdge };

export const InfluenceDiagram = () => {
	const {
		nodes,
		edges,
		onConnect,
		isValidConnection,
		onEdgesChange,
		onNodeDragStop,
		onNodesChange,
		onReconnect,
		onReconnectStart,
	} = useInfluenceDiagram();
	return (
		<div
			className='bg-background-light shadow-tile absolute
			inset-0 rounded-sm'
		>
			<div className='absolute top-4 right-4 z-10 flex gap-4'>
				<CreateIssues />
				<ToggleExpandAll />
			</div>
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
				onNodesChange={onNodesChange}
				onReconnectStart={onReconnectStart}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				connectionLineComponent={ConnectionLine}
				onConnect={onConnect}
				isValidConnection={isValidConnection}
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
	);
};
