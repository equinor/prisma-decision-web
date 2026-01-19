import { MarkerType } from '@xyflow/react';
import { DecisionTreeEdge } from '../components/common/DecisionTree/DecisionTreeEdge';
import { DecisionTreeNode } from '../components/common/DecisionTree/DecisionTreeNode';
import { ExpandNode } from '../components/common/DecisionTree/ExpandableNode';
import { OutputNode } from '../components/common/DecisionTree/OutputNode';

// Constants
export const NODE_TYPES = {
	treeNode: DecisionTreeNode,
	expandNode: ExpandNode,
	outputNode: OutputNode,
};

export const EDGE_TYPES = {
	decisionTreeEdge: DecisionTreeEdge,
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
