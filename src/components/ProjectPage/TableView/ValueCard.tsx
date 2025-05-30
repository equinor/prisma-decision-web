import { useSortable } from '@dnd-kit/react/sortable';
import { Button, Chip, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { Issue } from '../ProjectPage';

export const ValueCard = ({ issue, index }: ValueCardProps) => {
	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type: 'value',
		data: {
			issue,
		},
		accept: ['decision', 'uncertainty', 'value', 'fact', 'unassigned'],
		group: 'value',
		disabled: index === -1,
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
					<Chip>Value</Chip>
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
		</div>
	);
};

type ValueCardProps = {
	issue: Issue;
	index: number;
};
