import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { getIssueCardType } from '../../../utils/getIssueCardType';
import { Issue } from '../../../validators';

export const DiagramIssueCard = ({ data, selected }: NodeProps<Node<{ issue: Issue }>>) => {
	const IssueCard = getIssueCardType(data.issue.type);
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

			<div
				className={`rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
			>
				<IssueCard issue={data.issue} />
			</div>
		</>
	);
};
