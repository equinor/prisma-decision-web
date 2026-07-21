import { Background, ReactFlow } from '@xyflow/react';
import { useAtomValue } from 'jotai';
import { EDGE_TYPES, NODE_TYPES, REACT_FLOW_CONFIG } from '../../../config/decisionTree';
import { useGetSolutionTree } from '../../../hooks/api/useGetSolutionTree';
import { expandedDecisionTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { InvalidDiagramDialog } from '../../common/DecisionTree/InvalidDiagramDialog';
import { useDecisionTree } from '../../../hooks/useDecisionTree';
import { useSelectedProject } from '../ProjectContext';

export const SolutionTree = () => {
	const project = useSelectedProject();
	const expanded = useAtomValue(
		expandedDecisionTreeNodes({ projectId: project.id, treeType: 'solution' }),
	);

	const { data: decisionTree } = useGetSolutionTree(project.id, expanded);

	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { nodes, edges } = useDecisionTree(decisionTree, 'solution');

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
