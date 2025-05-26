import { useSortable } from '@dnd-kit/react/sortable';
import { Button, Chip, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { Issue } from '../ProjectPage';

export const FactCard = ({ issue, onDeleteIssue, index }: FactCardProps) => {
	const [deleteOpen, setDeleteOpen] = useState(false);

	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type: 'fact',
		accept: ['decision', 'uncertainty', 'value', 'fact', 'unassigned'],
		data: {
			issue,
		},
		group: 'fact',
	});

	return (
		<>
			<div
				ref={ref}
				data-dragging={isDragging && index !== -1}
				className='bg-background-default shadow-tile outline-primary-resting flex cursor-grab flex-col
                gap-2 rounded-sm p-4 data-[dragging="true"]:cursor-grabbing data-[dragging="true"]:opacity-40 data-[dragging="true"]:outline-1'
			>
				<div className='flex items-center justify-between'>
					<div className='flex gap-2'>
						<Chip>Fact</Chip>
						<Chip>In</Chip>
					</div>
					<div>
						<Button variant='ghost_icon'>
							<Icon data={edit} />
						</Button>
						<Button
							variant='ghost_icon'
							onMouseDown={() => {
								setDeleteOpen(true);
							}}
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				</div>
				<h3 className='font-semibold '>{issue.name}</h3>
				<p className='text-text-tertiary text-sm'>
					Lorem ipsum dolor sit amet consectetur adipisicing elit
				</p>
			</div>
			<DeleteIssueDialog
				issue={issue}
				onClose={() => setDeleteOpen(false)}
				onDeleteIssue={onDeleteIssue}
				open={deleteOpen}
			/>
		</>
	);
};

type FactCardProps = {
	issue: Issue;
	index: number;
	onDeleteIssue: (issue: Issue) => void;
};
