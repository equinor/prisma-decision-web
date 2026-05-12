import { Background, ReactFlow } from '@xyflow/react';
import { InvalidDiagramDialog } from '../../common/DecisionTree/InvalidDiagramDialog';
import { EDGE_TYPES, NODE_TYPES } from '../../../config/solutionTree';
import { REACT_FLOW_CONFIG } from '../../../config/decisionTree';
import { useSolutionTree } from './useSolutionTree';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';

export const SolutionTree = () => {
	const hasValidationError = useHasInfluenceDiagramError();
	const { nodes, edges } = useSolutionTree(!hasValidationError);

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
				{hasValidationError && <InvalidDiagramDialog />}
			</ReactFlow>
		</div>
	);
};
