import { Button, Icon } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { useExpandedTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { ReactFlowInfluenceNode } from '../../../types';

export const ExpandNode = ({ id }: NodeProps<ReactFlowInfluenceNode>) => {
	const { toggleExpanded } = useExpandedTreeNodes(id);

	return (
		<div className='pan flex h-full items-center'>
			<Handle
				type='target'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3! opacity-0'
			/>
			<Button
				variant='outlined'
				onClick={toggleExpanded}
				className='size-12! border-0! outline-2!'
			>
				<Icon data={add} />
			</Button>
		</div>
	);
};
