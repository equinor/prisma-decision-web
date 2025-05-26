import { useSortable } from '@dnd-kit/react/sortable';
import { Button, Chip, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { Issue } from '../ProjectPage';
import { useState } from 'react';
import { DeleteIssueDialog } from '../DeleteIssueDialog';

export const DecisionCard = ({ issue, index }: DecisionCardProps) => {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type: 'decision',
		accept: ['decision', 'uncertainty', 'value', 'fact', 'unassigned'],
		data: {
			issue,
		},
		group: 'decision',
	});
	return (
		<div
			ref={ref}
			data-dragging={isDragging && index !== -1}
			className='bg-background-default shadow-tile outline-primary-resting flex cursor-grab flex-col
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
					<Button variant='ghost_icon'>
						<Icon data={delete_to_trash} />
					</Button>
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
			<DeleteIssueDialog
				issue={issue}
				onClose={() => setDeleteOpen(false)}
				open={deleteOpen}
			/>
		</div>
	);
};

type DecisionCardProps = {
	issue: Issue;
	index: number;
};
