import { Background, ConnectionMode, Controls, MarkerType, ReactFlow } from '@xyflow/react';
import { ConnectionLine } from './ConnectingLine';
import { CustomEdge } from './CustomEdge';
import { DiagramIssueCard } from './DiagramIssueCard';
import { useDiagramView } from './useDiagramView';

const nodeTypes = { issue: DiagramIssueCard };
const edgeTypes = { issue: CustomEdge };

export const DiagramView = () => {
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
	} = useDiagramView();
	return (
		<div
			className='bg-background-light shadow-tile
			h-[calc(100vh-285px)] w-full rounded-sm'
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
