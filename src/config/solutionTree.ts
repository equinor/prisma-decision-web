import { MarkerType } from '@xyflow/react';
import { DecisionTreeNode } from '../components/common/DecisionTree/DecisionTreeNode';
import { OutputNode } from '../components/common/DecisionTree/OutputNode';
import { SolutionTreeEdge } from '../components/ProjectPage/SolutionDecisionTree/SolutionTreeEdge';

// Constants
export const NODE_TYPES = {
	treeNode: DecisionTreeNode,
	outputNode: OutputNode,
};

export const EDGE_TYPES = {
	solutionTreeEdge: SolutionTreeEdge,
};

export const REACT_FLOW_CONFIG = {
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
