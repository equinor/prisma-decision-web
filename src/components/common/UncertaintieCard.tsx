import { useSortable } from '@dnd-kit/react/sortable';
import { Chip } from '@equinor/eds-core-react';
import { Issue, issueTypes } from '../../validators';
import { DeleteIssueDialog } from '../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../ProjectPage/EditIssueModal';

export const UncertaintieCard = ({ issue, index }: UncertaintieCardProps) => {
	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type: 'Uncertainty',
		data: {
			issue,
		},
		accept: [...issueTypes],
		group: 'Uncertainty',
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
					<Chip>Uncertainty</Chip>
					<Chip>{issue.boundary}</Chip>
				</div>
				<div>
					<EditIssueModal issue={issue} />
					<DeleteIssueDialog issue={issue} />
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className='text-text-tertiary text-sm'>
				Lorem ipsum dolor sit amet consectetur adipisicing elit
			</p>
			<div className='flex flex-col gap-2'>
				<h4 className='text-sm font-medium'>Alternatives:</h4>
				<ul className='flex flex-col gap-2 rounded-sm text-sm'>
					<li className='bg-background-light flex items-center justify-between rounded-sm px-2 py-1'>
						<p>Outcome 1</p>
						<p>20%</p>
					</li>
					<li className='bg-background-light flex items-center justify-between rounded-sm px-2 py-1'>
						<p>Outcome 2</p>
						<p>30%</p>
					</li>
					<li className='bg-background-light flex items-center justify-between rounded-sm px-2 py-1'>
						<p>Outcome 3</p>
						<p>55%</p>
					</li>
				</ul>
			</div>
		</div>
	);
};

type UncertaintieCardProps = {
	issue: Issue;
	index: number;
};
