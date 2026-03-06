import { Background, ReactFlow } from '@xyflow/react';
import { InvalidDiagramDialog } from '../../common/DecisionTree/InvalidDiagramDialog';
import { useCompactTree } from './useCompactTree';
import { EDGE_TYPES, NODE_TYPES, REACT_FLOW_CONFIG } from '../../../config/compactTree';

export const CompactTree = () => {
	const { nodes, edges, isError } = useCompactTree();
	return (
		<div className='bg-background-light absolute inset-0 rounded-sm'>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				{...REACT_FLOW_CONFIG}
				nodeTypes={NODE_TYPES}
				edgeTypes={EDGE_TYPES}
			>
				<Background />
				{isError && <InvalidDiagramDialog />}
			</ReactFlow>
		</div>
	);
};
