import { Background, ConnectionMode, ReactFlow, SelectionMode } from '@xyflow/react';
import { useState } from 'react';

import { ConnectionLine } from './ConnectingLine';
import { DecisionNode } from './DecisionNode';
import { InfluenceEdge } from './InfluenceEdge';
import { UncertaintyNode } from './UncertaintyNode';
import { UtilityNode } from './UtilityNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';
import { InfluenceDiagramTool, InfluenceDiagramToolbar } from './InfluenceDiagramToolbar';
import { useInfluenceDiagramView } from './useInfluenceDiagramView';
import { ShapeNode } from './Shape/ShapeNode';

const nodeTypes = {
	decision: DecisionNode,
	uncertainty: UncertaintyNode,
	utility: UtilityNode,
};

const edgeTypes = { 'issue-edge': InfluenceEdge };
const shapeNodeTypes = {
	decision: ShapeNode,
	uncertainty: ShapeNode,
	utility: ShapeNode,
};

export const InfluenceDiagram = () => {
	const [view, setView] = useInfluenceDiagramView();
	const [tool, setTool] = useState<InfluenceDiagramTool>('pan');
	const {
		nodes,
		edges,
		onConnect,
		onEdgesDelete,
		isValidConnection,
		onNodesChange,
		onEdgesChange,
		onReconnect,
		onReconnectStart,
		onReconnectEnd,
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
				onEdgesDelete={onEdgesDelete}
				zoomOnDoubleClick={false}
				connectOnClick={false}
				nodesDraggable={false}
				selectionKeyCode={['Control']}
				onReconnect={onReconnect}
				panOnDrag={tool === 'pan'}
				selectionOnDrag={tool === 'selection'}
				onNodesChange={onNodesChange}
				onReconnectStart={onReconnectStart}
				onReconnectEnd={onReconnectEnd}
				onEdgeMouseEnter={onEdgeMouseEnter}
				onEdgeMouseLeave={onEdgeMouseLeave}
				nodeTypes={view === 'shape' ? shapeNodeTypes : nodeTypes}
				edgeTypes={edgeTypes}
				connectionLineComponent={ConnectionLine}
				onConnect={onConnect}
				isValidConnection={isValidConnection}
				proOptions={{ hideAttribution: true }}
				fitView
			>
				<Background />
				<InfluenceDiagramToolbar
					view={view}
					onViewChange={setView}
					tool={tool}
					onToolChange={setTool}
				/>
			</ReactFlow>
		</div>
	);
};
