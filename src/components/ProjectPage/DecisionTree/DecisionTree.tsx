import { useContext } from 'react';
import { Background, MarkerType, ReactFlow } from '@xyflow/react';
import { DecisionTreeEdge } from './DecisionTreeEdge';
import { useDecisionTree } from './useDecisionTree';
import { DecisionTreeNode } from './DecisionTreeNode';
import { ExpandNode } from './ExpandableNode';
import { OutputNode } from './OutputNode';
import { ErrorHandlingContext } from '../../context/ErrorHandlingContext';
import { Dialog, DialogContent, Button } from '@equinor/eds-core-react';

const nodeTypes = { treeNode: DecisionTreeNode, expandNode: ExpandNode, outputNode: OutputNode };
const edgeTypes = { decisionTreeEdge: DecisionTreeEdge };

export const DecisionTree = () => {
	const { nodes, edges } = useDecisionTree();
	const { errorHandlingState, setShowDecisionTree } = useContext(ErrorHandlingContext);

	return errorHandlingState.message ? (
		<div>
			<Dialog
				open={errorHandlingState.message !== ''}
				data-no-dnd
				className='nodrag nopan nowheel fixed top-1/2
					left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
			>
				<DialogContent>
					<div className='flex flex-col gap-4 text-center'>
						<h2 className='text-2xl font-semibold'>Invalid influence diagram</h2>
						<p className='text-text-tertiary'>
							Your influence diagram is invalid. The decision tree cannot be
							calculated. Open Validation to see how you can fix it.
						</p>
					</div>
					<div className='flex flex-col gap-2'>
						<Button
							variant='outlined'
							onClick={() => {
								setShowDecisionTree(true);
							}}
						>
							Go to Decision Tree
						</Button>
						<Button
							color='danger'
							onClick={() => {
								history.back();
							}}
						>
							Open Validation
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	) : (
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
