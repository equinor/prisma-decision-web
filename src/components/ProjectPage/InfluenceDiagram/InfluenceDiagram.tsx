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
import { Node, Edge } from '@xyflow/react';

const nodeTypes = { issue: InfluenceNode };
const edgeTypes = { issue: InfluenceEdge };

// Helper functions
const getNodeEdgeInfo = (nodeId: string, edges: Edge[]) => {
	const hasIncoming = edges.some(edge => edge.target === nodeId);
	const hasOutgoing = edges.some(edge => edge.source === nodeId);
	const hasAnyEdges = hasIncoming || hasOutgoing;

	return { hasIncoming, hasOutgoing, hasAnyEdges };
};

const getHandleClassName = (hasAnyEdges: boolean, isHighlighting: boolean) => {
	return isHighlighting && !hasAnyEdges
		? 'bg-red-500! z-1 h-4! w-4!' // Red for isolated nodes when highlighting
		: 'bg-primary-resting! z-1 h-3! w-3!'; // Default styling
};

const getValidationStyle = (issue: Issue, hasAnyEdges: boolean, validationType: string) => {
	const baseStyle = {
		border: '2px solid orange',
		boxShadow: '0 0 8px 2px orange',
	};

	switch (validationType) {
		case 'decisionNoOptions':
			return hasAnyEdges &&
				issue?.type === 'Decision' &&
				Array.isArray(issue.decision?.options) &&
				issue.decision.options.length === 0
				? baseStyle
				: {};

		case 'uncertaintyNoOutcomes':
			return hasAnyEdges &&
				issue?.type === 'Uncertainty' &&
				Array.isArray(issue.uncertainty?.outcomes) &&
				issue.uncertainty.outcomes.length === 0
				? baseStyle
				: {};

		default:
			return {};
	}
};

const processNode = (
	node: Node,
	edges: Edge[],
	validationFlags: {
		isHighlightNodesWithNoEdges: boolean;
		isHighlightDecisionNodeWithNoOptions: boolean;
		isHighlightUncertainityNodeWithNoOutcomes: boolean;
	},
) => {
	let style = { ...(node.style || {}) };
	const { hasAnyEdges } = getNodeEdgeInfo(node.id, edges);
	const issue: Issue = node?.data?.issue as Issue;

	// Update handle className based on connectivity and highlighting state
	const updatedNode = {
		...node,
		data: {
			...node.data,
			handleClassName: getHandleClassName(
				hasAnyEdges,
				validationFlags.isHighlightNodesWithNoEdges,
			),
		},
	};

	// Apply validation styles
	if (validationFlags.isHighlightDecisionNodeWithNoOptions) {
		const decisionStyle = getValidationStyle(issue, hasAnyEdges, 'decisionNoOptions');
		style = { ...style, ...decisionStyle };
	}

	if (validationFlags.isHighlightUncertainityNodeWithNoOutcomes) {
		const uncertaintyStyle = getValidationStyle(issue, hasAnyEdges, 'uncertaintyNoOutcomes');
		style = { ...style, ...uncertaintyStyle };
	}

	return { ...updatedNode, style };
};

export const InfluenceDiagram = () => {
	const { setErrorMessage, setShowDecisionTree } = useContext(ErrorHandlingContext);

	// Validation state
	const [isHighlightNodesWithNoEdges, setIsHighlightNodesWithNoEdges] = useState(false);
	const [isHighlightDecisionNodeWithNoOptions, setIsHighlightDecisionNodeWithNoOptions] =
		useState(false);
	const [
		isHighlightUncertainityNodeWithNoOutcomes,
		setIsHighlightUncertainityNodeWithNoOutcomes,
	] = useState(false);
	const [isHighlightLoops, setIsHighlightLoops] = useState(false);

	const validationFlags = {
		isHighlightNodesWithNoEdges,
		isHighlightDecisionNodeWithNoOptions,
		isHighlightUncertainityNodeWithNoOutcomes,
	};

	// Diagram hooks and handlers
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
	} = useInfluenceDiagram(setErrorMessage, setShowDecisionTree, {
		handleClassName: 'bg-primary-resting! z-1 h-3! w-3!',
	});

	// Process nodes with validation logic
	const processedNodes = nodes.map(node => processNode(node, edges, validationFlags));

	// Edge styling configuration
	const defaultEdgeOptions = {
		type: 'issue',
		markerEnd: {
			type: MarkerType.ArrowClosed,
			color: isHighlightLoops
				? 'rgba(var(--eds_danger), 1)'
				: 'rgba(var(--eds_primary_resting), 1)',
		},
	};

	// ReactFlow configuration
	const reactFlowConfig = {
		minZoom: 0.1,
		selectionMode: SelectionMode.Partial,
		connectionMode: ConnectionMode.Loose,
		panOnDrag: !isSelecting,
		selectNodesOnDrag: isSelecting,
		selectionKeyCode: ['Control'],
		selectionOnDrag: true,
		proOptions: { hideAttribution: true },
		fitView: true,
		fitViewOptions: { padding: 0.4 },
	};

	return (
		<div className='bg-background-light absolute inset-0 rounded-sm'>
			<ReactFlow
				{...reactFlowConfig}
				nodes={processedNodes}
				edges={edges}
				defaultEdgeOptions={defaultEdgeOptions}
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
