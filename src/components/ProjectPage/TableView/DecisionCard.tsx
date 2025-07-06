import { useSortable } from '@dnd-kit/react/sortable';
import { Button, Chip, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { Issue, issueTypes } from '../../../validators';
import { DeleteIssueDialog } from '../DeleteIssueDialog';

export const DecisionCard = ({ issue, index }: DecisionCardProps) => {
	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type: 'Decision',
		accept: [...issueTypes],
		data: {
			issue,
		},
		disabled: index === -1,
		group: 'Decision',
	});
	return (
		<div
			ref={ref}
			data-dragging={isDragging && index !== -1}
			className='bg-background-default shadow-tile outline-primary-resting flex max-w-[300px] cursor-grab flex-col
            gap-2 rounded-sm p-4 data-[dragging="true"]:cursor-grabbing data-[dragging="true"]:opacity-40 data-[dragging="true"]:outline-1'
		>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Decision</Chip>
					<Chip>In</Chip>
				</div>
				<div>
					<Button variant='ghost_icon'>
						<Icon data={edit} />
					</Button>
					<DeleteIssueDialog issue={issue} />
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className='text-text-tertiary text-sm'>
				Lorem ipsum dolor sit amet consectetur adipisicing elit
			</p>
			<div className='flex flex-col gap-2'>
				<h4 className='text-sm font-medium'>Alternatives:</h4>
				<ul className='flex flex-col gap-2 text-sm'>
					<li>Option 1</li>
					<li>Option 2</li>
					<li>Option 3</li>
				</ul>
			</div>
		</div>
	);
};

type DecisionCardProps = {
	issue: Issue;
	index: number;
};
