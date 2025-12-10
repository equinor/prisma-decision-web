import { useContext, useState } from 'react';
import { Background, ConnectionMode, MarkerType, ReactFlow, SelectionMode } from '@xyflow/react';

import { ConnectionLine } from './ConnectingLine';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { InfluenceEdge } from './InfluenceEdge';
import { InfluenceNode } from './InfluenceNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';
import { InfluenceDiagramValidation } from './InfluenceDiagramValidation';
import { ErrorHandlingContext } from '../../context/ErrorHandlingContext';
import { Issue } from '../../../validators';
const nodeTypes = { issue: InfluenceNode };
const edgeTypes = { issue: InfluenceEdge };

export const InfluenceDiagram = () => {
	const { setErrorMessage, setShowDecisionTree } = useContext(ErrorHandlingContext);

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
	} = useInfluenceDiagram(
		setErrorMessage,
		setShowDecisionTree,
		{ handleClassName: 'bg-primary-resting! z-1 h-3! w-3!' }, // Default styling
	);
	const [isHighlightNodesWithNoEdges, setIsHighlightNodesWithNoEdges] = useState(false);
	const [isHighlightDecisionNodeWithNoOptions, setIsHighlightDecisionNodeWithNoOptions] =
		useState(false);
	const [
		isHighlightUncertainityNodeWithNoOutcomes,
		setIsHighlightUncertainityNodeWithNoOutcomes,
	] = useState(false);
	const [isHighlightLoops, setIsHighlightLoops] = useState(false);

	return (
		<div
			className='bg-background-light absolute
			inset-0 rounded-sm'
		>
			<ReactFlow
				minZoom={0.1}
				nodes={nodes.map(node => {
					let style = { ...(node.style || {}) };
					const hasHead = edges.some(edge => edge.target === node.id);
					const hasTail = edges.some(edge => edge.source === node.id);
					const hasAnyEdges = hasHead || hasTail;
					const issue: Issue = node?.data?.node.issue as Issue;
					// Dynamically set handleClassName based on edge connectivity
					const updatedNode = {
						...node,
						data: {
							...node.data,
							handleClassName:
								isHighlightNodesWithNoEdges && !hasAnyEdges
									? 'bg-red-500! z-1 h-4! w-4!' // Red for isolated nodes
									: 'bg-primary-resting! z-1 h-3! w-3!', // Default for connected nodes
						},
					};

					if (
						isHighlightDecisionNodeWithNoOptions &&
						hasAnyEdges &&
						issue &&
						issue.type === 'Decision' &&
						Array.isArray(issue.decision?.options) &&
						issue.decision.options.length === 0
					) {
						style = {
							...style,
							border: '2px solid orange',
							boxShadow: '0 0 8px 2px orange',
						};
					}
					if (
						isHighlightUncertainityNodeWithNoOutcomes &&
						hasAnyEdges &&
						issue &&
						issue.type === 'Uncertainty' &&
						Array.isArray(issue.uncertainty?.outcomes) &&
						issue.uncertainty.outcomes.length === 0
					) {
						style = {
							...style,
							border: '2px solid orange',
							boxShadow: '0 0 8px 2px orange',
						};
					}

					return { ...updatedNode, style };
				})}
				edges={edges}
				defaultEdgeOptions={{
					type: 'issue',
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: isHighlightLoops
							? 'rgba(var(--eds_danger), 1)'
							: 'rgba(var(--eds_primary_resting), 1)',
					},
				}}
				selectionMode={SelectionMode.Partial}
				connectionMode={ConnectionMode.Loose}
				panOnDrag={!isSelecting}
				selectNodesOnDrag={isSelecting}
				selectionKeyCode={['Con33trol']}
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
				<InfluenceDiagramValidation
					isHighlightNodesWithNoEdges={isHighlightNodesWithNoEdges}
					isHighlightDecisionNodeWithNoOptions={isHighlightDecisionNodeWithNoOptions}
					isHighlightUncertainityNodeWithNoOutcomes={
						isHighlightUncertainityNodeWithNoOutcomes
					}
					isHighlightLoops={isHighlightLoops}
					handleHighlightNodesWithNoEdges={setIsHighlightNodesWithNoEdges}
					handleHighlightDecisionNodeWithNoOptions={
						setIsHighlightDecisionNodeWithNoOptions
					}
					handleHighlightUncertainityNodeWithNoOutcomes={
						setIsHighlightUncertainityNodeWithNoOutcomes
					}
					handleHighlightLoops={setIsHighlightLoops}
				/>
				<DraggableToolbar
					onClickPanMode={onClickPanMode}
					onClickSelectionMode={onClickSelectionMode}
				/>
			</ReactFlow>
		</div>
	);
};
