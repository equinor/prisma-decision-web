import { Background, ReactFlow } from '@xyflow/react';
import { EDGE_TYPES, NODE_TYPES, REACT_FLOW_CONFIG } from '../../../config/decisionTree';
import { InvalidDiagramDialog } from '../../common/DecisionTree/InvalidDiagramDialog';
import { useDecisionTree } from './useDecisionTree';
import { useGetInfluenceDiagramErrors } from '../../../hooks/api/useGetInfluenceDiagramErrors';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const DecisionTree = () => {
	const selectedProject = useSelectedProject();
	const { data: errors } = useGetInfluenceDiagramErrors(selectedProject?.id);
	const hasValidationError = !!errors?.message;
	const { nodes, edges } = useDecisionTree(!hasValidationError);

	return (
		<div className='bg-background-light absolute inset-0 rounded-sm'>
			<ReactFlow
				{...REACT_FLOW_CONFIG}
				nodes={nodes}
				edges={edges}
				nodeTypes={NODE_TYPES}
				edgeTypes={EDGE_TYPES}
			>
				{hasValidationError && <InvalidDiagramDialog />}
				<Background />
			</ReactFlow>
		</div>
	);
};
