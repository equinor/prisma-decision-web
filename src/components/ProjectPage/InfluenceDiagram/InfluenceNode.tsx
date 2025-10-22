import { Handle, Node, NodeProps, NodeResizeControl, Position } from '@xyflow/react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { getIssueCardType } from '../../../utils/getIssueCardType';
import { Issue } from '../../../validators';
import { CardContainer } from '../../common/Cards/CardContainer';

export const InfluenceNode = ({ data, selected }: NodeProps<Node<{ issue: Issue }>>) => {
	const { expanded } = useExpandCard(data.issue.id);
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
				className={`h-full w-full overflow-hidden rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
			/>
			{expanded && (
				<CardContainer
					className={`mt-2 h-auto w-full overflow-hidden rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
				>
					<div className='mb-2 flex flex-col'>
						<ul className='flex flex-col gap-2 text-sm'>
							{data.issue.decision.options.map(option => (
								<li
									key={option.id}
									className='bg-background-light flex justify-between rounded-sm px-2 py-1'
								>
									<p>{option.name}</p>
									<p>{option.utility}</p>
								</li>
							))}
						</ul>
					</div>
				</CardContainer>
			)}
			<NodeResizeControl
				position='top-right'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
			<NodeResizeControl
				position='top-left'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
			<NodeResizeControl
				position='bottom-left'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
			<NodeResizeControl
				position='bottom-right'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
		</>
	);
};
