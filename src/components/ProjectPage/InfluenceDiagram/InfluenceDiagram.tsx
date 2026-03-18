import {
	Background,
	ConnectionMode,
	MarkerType,
	ReactFlow,
	SelectionMode,
	useNodesInitialized,
	useReactFlow,
} from '@xyflow/react';

import { useEffect } from 'react';
import { ReactFlowInfluenceNode } from '../../../types';
import { getInfluenceDiagramLayout } from '../../../utils/getInfluenceDiagramLayout';
import { ConnectionLine } from './ConnectingLine';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { InfluenceEdge } from './InfluenceEdge';
import { InfluenceNode } from './InfluenceNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';

const nodeTypes = { issue: InfluenceNode };
const edgeTypes = { issue: InfluenceEdge };

const Test = () => {
	const ready = useNodesInitialized();
	const { getNodes, setNodes, getEdges, setEdges } = useReactFlow<ReactFlowInfluenceNode>();
	const edgesToLayout = getEdges();
	const nodesToLayout = getNodes();
	useEffect(() => {
		if (!ready) return;
		(async () => {
			const { nodes: layoutedNodes, edges: layoutedEdges } = await getInfluenceDiagramLayout(
				nodesToLayout,
				edgesToLayout,
			);
			setNodes(layoutedNodes);
			setEdges(layoutedEdges);
		})();
	}, [ready]);

	return null;
};

export const InfluenceDiagram = () => {
	const {
		nodes,
		edges,
		onConnect,
		isValidConnection,
		onEdgesChange,
		onNodesChange,
		onReconnect,
		onReconnectStart,
		onClickPanMode,
		onClickSelectionMode,
		isSelecting,
		onEdgeMouseEnter,
		onEdgeMouseLeave,
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
				zoomOnDoubleClick={false}
				panOnDrag={!isSelecting}
				nodesDraggable={false}
				selectNodesOnDrag={isSelecting}
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
				onEdgesChange={onEdgesChange}
				proOptions={{ hideAttribution: true }}
				fitView
				fitViewOptions={{ padding: 0.4 }}
			>
				<Test />
				<Background />
				<DraggableToolbar
					onClickPanMode={onClickPanMode}
					onClickSelectionMode={onClickSelectionMode}
				/>
			</ReactFlow>
		</div>
	);
};
