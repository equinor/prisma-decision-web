import { Background, ConnectionMode, MarkerType, ReactFlow, SelectionMode } from '@xyflow/react';

import { ConnectionLine } from './ConnectingLine';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { InfluenceEdge } from './InfluenceEdge';
import { DecisionNode } from './DecisionNode';
import { UncertaintyNode } from './UncertaintyNode';
import { UtilityNode } from './UtilityNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';

const nodeTypes = {
	decision: DecisionNode,
	uncertainty: UncertaintyNode,
	utility: UtilityNode,
};

const edgeTypes = { 'issue-edge': InfluenceEdge };

export const InfluenceDiagram = () => {
	const {
		nodes,
		edges,
		onConnect,
		isValidConnection,
		onNodesChange,
		onEdgesChange,
		onReconnect,
		onReconnectStart,
		onClickPanMode,
		onClickSelectionMode,
		isSelecting,
		onEdgeMouseEnter,
		onEdgeMouseLeave,
		onDeleteEdges,
	} = useInfluenceDiagram();

	return (
		<div
			className='influence-diagram bg-background-light absolute
			inset-0 rounded-sm'
		>
			<ReactFlow
				minZoom={0.1}
				nodes={nodes}
				edges={edges}
				defaultEdgeOptions={{
					type: 'issue-edge',
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: 'rgba(var(--eds_primary_resting), 1)',
					},
				}}
				selectionMode={SelectionMode.Partial}
				connectionMode={ConnectionMode.Strict}
				onEdgesChange={onEdgesChange}
				zoomOnDoubleClick={false}
				panOnDrag={!isSelecting}
				connectOnClick={false}
				nodesDraggable={false}
				selectNodesOnDrag={isSelecting}
				selectionKeyCode={['Control']}
				onReconnect={onReconnect}
				selectionOnDrag={true}
				onNodesChange={onNodesChange}
				onEdgesDelete={onDeleteEdges}
				onReconnectStart={onReconnectStart}
				onEdgeMouseEnter={onEdgeMouseEnter}
				onEdgeMouseLeave={onEdgeMouseLeave}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				connectionLineComponent={ConnectionLine}
				onConnect={onConnect}
				isValidConnection={isValidConnection}
				proOptions={{ hideAttribution: true }}
				fitView
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
