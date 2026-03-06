import { MarkerType } from '@xyflow/react';
import { CompactTreeEdge } from '../components/ProjectPage/CompactTree/CompactTreeEdge';
import { DecisionTreeNode } from '../components/common/DecisionTree/DecisionTreeNode';

export const EDGE_TYPES = {
	compactTreeEdge: CompactTreeEdge,
};

export const NODE_TYPES = {
	treeNode: DecisionTreeNode,
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
