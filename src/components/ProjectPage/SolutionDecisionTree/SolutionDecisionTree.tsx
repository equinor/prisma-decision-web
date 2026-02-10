import { Background, ReactFlow } from '@xyflow/react';
import { InvalidDiagramDialog } from '../../common/DecisionTree/InvalidDiagramDialog';
import { useSolutionDecisionTree } from './useSolutionDecisionTree';
import { EDGE_TYPES, NODE_TYPES } from '../../../config/solutionTree';
import { REACT_FLOW_CONFIG } from '../../../config/decisionTree';

export const SolutionTree = () => {
	const { isError, nodes, edges } = useSolutionDecisionTree();
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
				{isError && <InvalidDiagramDialog />}
			</ReactFlow>
		</div>
	);
};
