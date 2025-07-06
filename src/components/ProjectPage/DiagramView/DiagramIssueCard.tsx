import { NodeProps, Handle, Position, Node } from '@xyflow/react';
import { getCardType } from '../../../utils/getCardType';
import { Issue } from '../../../validators';

export const DiagramIssueCard = ({ data }: NodeProps<Node<{ issue: Issue }>>) => {
	const IssueCard = getCardType(data.issue.type);
	return (
		<div>
			<Handle
				type='source'
				position={Position.Top}
				id='a'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<IssueCard issue={data.issue} index={-1} />
			<Handle
				type='source'
				position={Position.Bottom}
				id='b'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Left}
				id='c'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Right}
				id='d'
				className='bg-primary-resting! h-3! w-3!'
			/>
		</div>
	);
};
