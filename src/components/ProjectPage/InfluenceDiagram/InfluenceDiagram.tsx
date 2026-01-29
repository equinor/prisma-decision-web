import { Background, ConnectionMode, MarkerType, ReactFlow, SelectionMode } from '@xyflow/react';

import { ConnectionLine } from './ConnectingLine';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { InfluenceEdge } from './InfluenceEdge';
import { InfluenceNode } from './InfluenceNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';
import { InfluenceDiagramValidation } from './InfluenceDiagramValidation';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { BottomNavigation } from '../../common/BottomNavigation';
import { useDecisionTree } from '../DecisionTree/useDecisionTree';

const nodeTypes = { issue: InfluenceNode };
const edgeTypes = { issue: InfluenceEdge };

export const InfluenceDiagram = () => {
	const project = useSelectedProject();
	const { isError } = useDecisionTree();
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
		onEdgeMouseEnter,
		onEdgeMouseLeave,
	} = useInfluenceDiagram();

	return (
		<div className='bg-background-light fixed top-[64px] right-0 bottom-[72px] left-[64px] rounded-sm'>
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
				<Background />
				<InfluenceDiagramValidation />
				<DraggableToolbar
					onClickPanMode={onClickPanMode}
					onClickSelectionMode={onClickSelectionMode}
				/>
				<BottomNavigation
					back={{
						label: 'Back to Issues',
						to: `/project/${project?.id}/issues`,
					}}
					next={{
						label: 'Go to decision tree',
						to: `/project/${project?.id}/decision-tree`,
						disabled: isError,
					}}
				/>
			</ReactFlow>
		</div>
	);
};
