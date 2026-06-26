import { Button, Icon } from '@equinor/eds-core-react';
import { mail_unread } from '@equinor/eds-icons';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useLocation } from 'react-router';
import { useSelectedDecisionTreePath } from '../../../hooks/useSelectedDecisionTreePath';

export const OutputNode = ({
	data,
}: NodeProps<Node<{ value: number; statePath: string[]; cumulativeProbability: number }>>) => {
	const location = useLocation();
	const treeType = location.pathname.includes('solution') ? 'solution' : 'decision';
	const { selectPath } = useSelectedDecisionTreePath(treeType);
	return (
		<div className='pan flex h-full items-center'>
			<Handle
				type='target'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3! opacity-0'
			/>
			<Button
				onClick={() => selectPath(data.statePath.length > 0 ? data.statePath : null)}
				variant='outlined'
				className='size-12! border-0! outline-2!'
			>
				<Icon data={mail_unread} />
			</Button>
			<div>
				<p className='ml-4 whitespace-nowrap'>
					<span className='font-semibold'>Value: </span> {data.value}
				</p>
				{data.cumulativeProbability > 0 && (
					<p className='ml-4 whitespace-nowrap'>
						<span className='font-semibold'>Cumulative probability: </span>{' '}
						{parseFloat(data.cumulativeProbability.toFixed(4))}
					</p>
				)}
			</div>
		</div>
	);
};
