import { Button, Icon } from '@equinor/eds-core-react';
import { mail_unread } from '@equinor/eds-icons';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useSetAtom } from 'jotai';
import { testAtom } from '../../ProjectPage/DecisionTree/useDecisionTree';

export const OutputNode = ({ data }: NodeProps<Node<{ path: Set<string> }>>) => {
	const setSelectedNodes = useSetAtom(testAtom);
	return (
		<div className='pan flex h-full items-center'>
			<Handle
				type='target'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3! opacity-0'
			/>
			<Button
				onClick={() => setSelectedNodes(new Set(data.path))}
				variant='outlined'
				className='size-12! border-0! outline-2!'
			>
				<Icon data={mail_unread} />
			</Button>
		</div>
	);
};
