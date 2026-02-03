import { Background, ReactFlow } from '@xyflow/react';
import { EDGE_TYPES, NODE_TYPES, REACT_FLOW_CONFIG } from '../../../config/decisionTree';
import { InvalidDiagramDialog } from '../../common/DecisionTree/InvalidDiagramDialog';
import { useDecisionTree } from './useDecisionTree';

export const DecisionTree = () => {
	const { isError, nodes, edges } = useDecisionTree();
	if (isError) return <InvalidDiagramDialog />;
	return (
		<div className='bg-background-light fixed top-[64px] right-0 bottom-[72px] left-[64px] rounded-sm'>
			{' '}
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
