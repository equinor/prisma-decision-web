import { Background, ConnectionMode, ReactFlow, SelectionMode } from '@xyflow/react';

import { ConnectionLine } from './ConnectingLine';
import { DecisionNode } from './DecisionNode';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { InfluenceEdge } from './InfluenceEdge';
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
		onEdgeMouseEnter,
		onEdgeMouseLeave,
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
				}}
				selectionMode={SelectionMode.Partial}
				connectionMode={ConnectionMode.Strict}
				onEdgesChange={onEdgesChange}
				zoomOnDoubleClick={false}
				connectOnClick={false}
				nodesDraggable={false}
				selectionKeyCode={['Control']}
				onReconnect={onReconnect}
				selectionOnDrag={true}
				onNodesChange={onNodesChange}
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
				<DraggableToolbar />
			</ReactFlow>
		</div>
	);
};
