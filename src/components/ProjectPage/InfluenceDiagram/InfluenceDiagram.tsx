import { Background, ConnectionMode, MarkerType, ReactFlow, SelectionMode } from '@xyflow/react';

import { ConnectionLine } from './ConnectingLine';
import { CustomEdge } from './CustomEdge';
import { IssueNode } from './IssueNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';

const nodeTypes = { issue: IssueNode };
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
		onClickPanMode,
		onClickSelectionMode,
		isSelecting,
	} = useInfluenceDiagram();

	return (
		<div
			className='bg-background-light absolute
			inset-0 rounded-sm'
		>
			<ReactFlow
				minZoom={0.1}
				nodes={nodes}
				edges={edges}
				defaultEdgeOptions={{
					type: 'issue',
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: 'rgba(var(--eds_primary_resting), 1)',
					},
				}}
				selectionMode={SelectionMode.Partial}
				connectionMode={ConnectionMode.Loose}
				panOnDrag={!isSelecting}
				selectNodesOnDrag={isSelecting}
				selectionKeyCode={['Control']}
				onReconnect={onReconnect}
				selectionOnDrag={true}
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
				fitViewOptions={{ padding: 0.4 }}
			>
				<Background />
				<DraggableToolbar
					onClickPanMode={onClickPanMode}
					onClickSelectionMode={onClickSelectionMode}
				/>
			</ReactFlow>
		</div>
	);
};
