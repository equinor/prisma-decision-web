import { Background, MarkerType, ReactFlow } from '@xyflow/react';
import { DecisionTreeEdge } from './DecisionTreeEdge';
import { useDecisionTree } from './useDecisionTree';
import { DecisionTreeNode } from './DecisionTreeNode';
import { ExpandNode } from './ExpandableNode';
import { OutputNode } from './OutputNode';

const nodeTypes = { treeNode: DecisionTreeNode, expandNode: ExpandNode, outputNode: OutputNode };
const edgeTypes = { decisionTreeEdge: DecisionTreeEdge };

export const DecisionTree = () => {
	const { nodes, edges } = useDecisionTree();
	return (
		<div className='bg-background-light absolute inset-0 rounded-sm'>
			<ReactFlow
				minZoom={0.01}
				nodes={nodes}
				edges={edges}
				defaultMarkerColor={'rgba(var(--eds_primary_resting), 1)'}
				defaultEdgeOptions={{
					markerEnd: {
						type: MarkerType.ArrowClosed,
					},
				}}
				nodesDraggable={false}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				proOptions={{ hideAttribution: true }}
				fitView
			>
				<Background />
			</ReactFlow>
		</div>
	);
};
