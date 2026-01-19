import { Background, ReactFlow } from '@xyflow/react';
import { EDGE_TYPES, NODE_TYPES, REACT_FLOW_CONFIG } from '../../../config/decisionTree';
import { InvalidDiagramDialog } from '../../common/DecisionTree/InvalidDiagramDialog';
import { useSolutionDecisionTree } from './useSolutionDecisionTree';

export const SolutionTree = () => {
	const { isError, nodes, edges } = useSolutionDecisionTree();
	if (isError) return <InvalidDiagramDialog />;
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
