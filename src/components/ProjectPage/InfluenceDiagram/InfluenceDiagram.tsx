import { useContext, useState } from 'react';
import {
	Background,
	ConnectionMode,
	MarkerType,
	ReactFlow,
	SelectionMode,
	Edge as ReactFlowEdge,
} from '@xyflow/react';

import { ConnectionLine } from './ConnectingLine';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { InfluenceEdge } from './InfluenceEdge';
import { InfluenceNode } from './InfluenceNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';
import { InfluenceDiagramValidation } from './InfluenceDiagramValidation';
import { ErrorHandlingContext } from '../../context/ErrorHandlingContext';
import { Issue } from '../../../validators';
import { ReactFlowInfluenceNode } from '../../../types';

interface ReactFlowConfig {
	minZoom: number;
	selectionMode: SelectionMode;
	connectionMode: ConnectionMode;
	panOnDrag: boolean;
	selectNodesOnDrag: boolean;
	selectionKeyCode: string[];
	selectionOnDrag: boolean;
	proOptions: { hideAttribution: boolean };
	fitView: boolean;
	fitViewOptions: { padding: number };
}
const nodeTypes = { issue: InfluenceNode };
const edgeTypes = { issue: InfluenceEdge };

const getNodeConnectivity = (nodeId: string, edges: ReactFlowEdge[]) => {
	const hasIncoming = edges.some(edge => edge.target === nodeId);
	const hasOutgoing = edges.some(edge => edge.source === nodeId);
	const hasAnyEdges = hasIncoming || hasOutgoing;

	return { hasIncoming, hasOutgoing, hasAnyEdges };
};

const calculateHandleClassName = (hasAnyEdges: boolean, isHighlighting: boolean): string => {
	return isHighlighting && !hasAnyEdges
		? 'bg-red-500! z-1 h-4! w-4!' // Red for isolated nodes
		: 'bg-primary-resting! z-1 h-3! w-3!'; // Default styling
};

const getValidationStyles = (
	issue: Issue,
	hasAnyEdges: boolean,
	validationFlags: ValidationFlags,
) => {
	const baseValidationStyle = {
		border: '2px solid orange',
		boxShadow: '0 0 8px 2px orange',
	};

	let style = {};

	// Decision nodes without options validation
	if (
		validationFlags.isHighlightDecisionNodeWithNoOptions &&
		hasAnyEdges &&
		issue?.type === 'Decision' &&
		Array.isArray(issue.decision?.options) &&
		issue.decision.options.length === 0
	) {
		style = { ...style, ...baseValidationStyle };
	}

	// Uncertainty nodes without outcomes validation
	if (
		validationFlags.isHighlightUncertaintyNodeWithNoOutcomes &&
		hasAnyEdges &&
		issue?.type === 'Uncertainty' &&
		Array.isArray(issue.uncertainty?.outcomes) &&
		issue.uncertainty.outcomes.length === 0
	) {
		style = { ...style, ...baseValidationStyle };
	}

	return style;
};

const processNode = (
	node: ReactFlowInfluenceNode,
	edges: ReactFlowEdge[],
	validationFlags: ValidationFlags,
): ReactFlowInfluenceNode => {
	const { hasAnyEdges } = getNodeConnectivity(node.id, edges);
	const issue: Issue = node?.data?.node?.issue as Issue;

	// Calculate styles
	let nodeStyle = { ...(node.style || {}) };
	const validationStyles = getValidationStyles(issue, hasAnyEdges, validationFlags);
	nodeStyle = { ...nodeStyle, ...validationStyles };

	// Update node with new data and styles
	return {
		...node,
		data: {
			...node.data,
			handleClassName: calculateHandleClassName(
				hasAnyEdges,
				validationFlags.isHighlightNodesWithNoEdges,
			),
		},
		style: nodeStyle,
	};
};

// Types
interface ValidationFlags {
	isHighlightNodesWithNoEdges: boolean;
	isHighlightDecisionNodeWithNoOptions: boolean;
	isHighlightUncertaintyNodeWithNoOutcomes: boolean;
	isHighlightLoops: boolean;
}

export const InfluenceDiagram = () => {
	const { setErrorMessage, setShowDecisionTree } = useContext(ErrorHandlingContext);

	// State management
	const [isHighlightNodesWithNoEdges, setIsHighlightNodesWithNoEdges] = useState(false);
	const [isHighlightDecisionNodeWithNoOptions, setIsHighlightDecisionNodeWithNoOptions] =
		useState(false);
	const [isHighlightUncertaintyNodeWithNoOutcomes, setIsHighlightUncertaintyNodeWithNoOutcomes] =
		useState(false);
	const [isHighlightLoops, setIsHighlightLoops] = useState(false);

	// Validation flags object
	const validationFlags: ValidationFlags = {
		isHighlightNodesWithNoEdges,
		isHighlightDecisionNodeWithNoOptions,
		isHighlightUncertaintyNodeWithNoOutcomes,
		isHighlightLoops,
	};

	// Diagram data and handlers
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
	} = useInfluenceDiagram(setErrorMessage, setShowDecisionTree, {
		handleClassName: 'bg-primary-resting! z-1 h-3! w-3!',
	});

	// Process nodes with validation logic
	const processedNodes = nodes.map(node => processNode(node, edges, validationFlags));

	// ReactFlow configuration
	const reactFlowConfig: ReactFlowConfig = {
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

	// Edge options
	const defaultEdgeOptions = {
		type: 'issue',
		markerEnd: {
			type: MarkerType.ArrowClosed,
			color: isHighlightLoops
				? 'rgba(var(--eds_danger), 1)'
				: 'rgba(var(--eds_primary_resting), 1)',
		},
	};

	// Validation handlers
	const validationHandlers = {
		handleHighlightNodesWithNoEdges: setIsHighlightNodesWithNoEdges,
		handleHighlightDecisionNodeWithNoOptions: setIsHighlightDecisionNodeWithNoOptions,
		handleHighlightUncertaintyNodeWithNoOutcomes: setIsHighlightUncertaintyNodeWithNoOutcomes,
		handleHighlightLoops: setIsHighlightLoops,
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
				onEdgeMouseEnter={onEdgeMouseEnter}
				onEdgeMouseLeave={onEdgeMouseLeave}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				connectionLineComponent={ConnectionLine}
				onConnect={onConnect}
				isValidConnection={isValidConnection}
				onEdgesChange={onEdgesChange}
			>
				<Background />
				<InfluenceDiagramValidation {...validationFlags} {...validationHandlers} />
				<DraggableToolbar
					onClickPanMode={onClickPanMode}
					onClickSelectionMode={onClickSelectionMode}
				/>
			</ReactFlow>
		</div>
	);
};
