import { NodeProps, Handle, Position, Node } from '@xyflow/react';
import { getCardType } from '../../../utils/getCardType';
import { Issue } from '../../../validators';

export const DiagramIssueCard = ({ data, selected }: NodeProps<Node<{ issue: Issue }>>) => {
	const IssueCard = getCardType(data.issue.type);
	return (
		<>
			{/* Source handles */}
			<Handle
				type='source'
				position={Position.Top}
				id='top'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Bottom}
				id='bottom'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Right}
				id='right'
				className='bg-primary-resting! h-3! w-3!'
			/>

			{/* Target handles */}
			<Handle
				type='target'
				position={Position.Top}
				id='top'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='target'
				position={Position.Bottom}
				id='bottom'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='target'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! h-3! w-3!'
			/>
			<Handle
				type='target'
				position={Position.Right}
				id='right'
				className='bg-primary-resting! h-3! w-3!'
			/>

			<div className={`rounded-sm outline-2 ${getBorderColor(data.issue.type, selected)}`}>
				<IssueCard issue={data.issue} />
			</div>
		</>
	);
};

const getBorderColor = (type: string, selected: boolean) => {
	switch (type) {
		case 'Unassigned':
			return selected
				? 'outline-blue-400'
				: 'outline-blue-400/50 has-[:hover]:outline-blue-400';
		case 'Decision':
			return selected ? 'outline-red-400' : 'outline-red-400/50 has-[:hover]:outline-red-400';
		case 'Uncertainty':
			return selected
				? 'outline-pink-400'
				: 'outline-pink-400/50 has-[:hover]:outline-pink-400';
		case 'Value Metric':
			return selected
				? 'outline-emerald-400'
				: 'outline-emerald-400/50 has-[:hover]:outline-emerald-400';
		case 'Fact':
			return selected
				? 'outline-cyan-400'
				: 'outline-cyan-400/50 has-[:hover]:outline-cyan-400';
		default:
			return selected
				? 'outline-gray-400'
				: 'outline-gray-400/50 has-[:hover]:outline-gray-400';
	}
};
