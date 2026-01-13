import { Background, MarkerType, ReactFlow } from '@xyflow/react';
import { Dialog, DialogContent, Button } from '@equinor/eds-core-react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { DecisionTreeEdge } from './DecisionTreeEdge';
import { DecisionTreeNode } from './DecisionTreeNode';
import { ExpandNode } from './ExpandableNode';
import { OutputNode } from './OutputNode';
import { useDecisionTree } from './useDecisionTree';

// Constants
const NODE_TYPES = {
	treeNode: DecisionTreeNode,
	expandNode: ExpandNode,
	outputNode: OutputNode,
};

const EDGE_TYPES = {
	decisionTreeEdge: DecisionTreeEdge,
};

const REACT_FLOW_CONFIG = {
	minZoom: 0.01,
	nodesDraggable: false,
	proOptions: { hideAttribution: true },
	fitView: true,
	defaultMarkerColor: 'rgba(var(--eds_primary_resting), 1)',
	defaultEdgeOptions: {
		markerEnd: {
			type: MarkerType.ArrowClosed,
		},
	},
};

// Helper Functions
const getInfluenceDiagramPath = (currentPath: string): string => {
	return currentPath.replace(/\/decision-tree$/, '/influence-diagram');
};

// Invalid Diagram Dialog Component
interface InvalidDiagramDialogProps {
	isOpen: boolean;
	onStay: () => void;
	onNavigateToValidation: () => void;
}

const InvalidDiagramDialog = ({
	isOpen,
	onStay,
	onNavigateToValidation,
}: InvalidDiagramDialogProps) => {
	return (
		<Dialog
			open={isOpen}
			data-no-dnd
			className='nodrag nopan nowheel fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
		>
			<DialogContent>
				<div className='flex flex-col gap-4 text-center'>
					<h2 className='text-2xl font-semibold'>Invalid influence diagram</h2>
					<p className='text-text-tertiary'>
						Your influence diagram is invalid. The decision tree cannot be calculated.
						Open Validation to see how you can fix it.
					</p>
				</div>
				<div className='flex flex-col gap-2'>
					<Button variant='outlined' onClick={onStay}>
						Stay on Decision Tree
					</Button>
					<Button color='danger' onClick={onNavigateToValidation}>
						Open Validation
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

// Main Component
export const DecisionTree = () => {
	const navigate = useNavigate();
	const { isError, nodes, edges } = useDecisionTree();
	const [showDialog, setShowDialog] = useState(true);

	const handleStayOnDecisionTree = useCallback(() => {
		setShowDialog(false);
	}, []);

	const handleNavigateToValidation = useCallback(() => {
		const validationPath = getInfluenceDiagramPath(window.location.pathname);
		navigate(validationPath);
	}, [navigate]);

	// Show error dialog
	if (isError && showDialog) {
		return (
			<InvalidDiagramDialog
				isOpen={true}
				onStay={handleStayOnDecisionTree}
				onNavigateToValidation={handleNavigateToValidation}
			/>
		);
	}

	// Show decision tree
	return (
		<div className='bg-background-light absolute inset-0 rounded-sm'>
			<ReactFlow
				{...REACT_FLOW_CONFIG}
				nodes={nodes}
				edges={edges}
				nodeTypes={NODE_TYPES}
				edgeTypes={EDGE_TYPES}
			>
				<Background />
			</ReactFlow>
		</div>
	);
};
