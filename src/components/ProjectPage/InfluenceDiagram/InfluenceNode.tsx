import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { getIssueCardType } from '../../../utils/getIssueCardType';
import { Issue } from '../../../validators';

export const InfluenceNode = ({ data, selected }: NodeProps<Node<{ issue: Issue }>>) => {
	const IssueCard = getIssueCardType(data.issue.type);
	return (
		<>
			<Handle
				type='source'
				position={Position.Top}
				id='top'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Bottom}
				id='bottom'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Right}
				id='right'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>

			<IssueCard
				issue={data.issue}
				className={`h-full max-w-[350px] overflow-hidden rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
			/>
		</>
	);
};
