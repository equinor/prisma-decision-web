import { Background, ConnectionMode, ReactFlow, SelectionMode } from '@xyflow/react';

import { ConnectionLine } from './ConnectingLine';
import { useInfluenceDiagramNodeView } from '../../../hooks/useInfluenceDiagramNodeView';
import { useEffect, useState } from 'react';
import { DecisionNode } from './DecisionNode';
import { EditIssueSideSheet } from './EditIssueSideSheet';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { InfluenceEdge } from './InfluenceEdge';
import { DecisionShapeNode, UncertaintyShapeNode, UtilityShapeNode } from './InfluenceShapeNode';
import { SheetIssueIdContext } from './SheetIssueIdContext';
import { UncertaintyNode } from './UncertaintyNode';
import { UtilityNode } from './UtilityNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';

const cardNodeTypes = {
	decision: DecisionNode,
	uncertainty: UncertaintyNode,
	utility: UtilityNode,
};

const shapeNodeTypes = {
	decision: DecisionShapeNode,
	uncertainty: UncertaintyShapeNode,
	utility: UtilityShapeNode,
};

const edgeTypes = { 'issue-edge': InfluenceEdge };

export const InfluenceDiagram = () => {
	const {
		nodes,
		edges,
		onConnect,
		isValidConnection,
		onNodesChange,
		onNodeDragStop,
		onEdgesChange,
		onReconnect,
		onReconnectStart,
		onClickPanMode,
		onClickSelectionMode,
		isSelecting,
		onEdgeMouseEnter,
		onEdgeMouseLeave,
	} = useInfluenceDiagram();
	const [nodeView] = useInfluenceDiagramNodeView();
	const nodeTypes = nodeView === 'shape' ? shapeNodeTypes : cardNodeTypes;
	const [sheetIssueId, setSheetIssueId] = useState<string | null>(null);
	useEffect(() => {
		if (nodeView !== 'shape' || !sheetIssueId) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setSheetIssueId(null);
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [nodeView, sheetIssueId]);

	return (
		<SheetIssueIdContext value={nodeView === 'shape' ? sheetIssueId : null}>
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
					panOnDrag={!isSelecting}
					connectOnClick={false}
					nodesDraggable={nodeView === 'shape'}
					nodeDragThreshold={4}
					onNodeDragStop={onNodeDragStop}
					selectNodesOnDrag={isSelecting}
					selectionKeyCode={['Control']}
					onReconnect={onReconnect}
					selectionOnDrag={true}
					onNodesChange={onNodesChange}
					onReconnectStart={onReconnectStart}
					onEdgeMouseEnter={onEdgeMouseEnter}
					onEdgeMouseLeave={onEdgeMouseLeave}
					onNodeClick={(_, node) => {
						if (nodeView === 'shape') {
							setSheetIssueId(currentId =>
								currentId === node.data.issue_id ? null : node.data.issue_id,
							);
						}
					}}
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
				{nodeView === 'shape' && sheetIssueId && (
					<EditIssueSideSheet
						issueId={sheetIssueId}
						onClose={() => setSheetIssueId(null)}
					/>
				)}
			</div>
		</SheetIssueIdContext>
	);
};
