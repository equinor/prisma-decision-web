import { Chip } from '@equinor/eds-core-react';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';

export const UncertaintyeCard = ({ issue }: UncertaintieCardProps) => {
	return (
		<div
			className='bg-background-default shadow-tile
			flex w-full max-w-[450px] min-w-[241px] cursor-grab flex-col gap-2 rounded-sm p-4'
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
			<p className='text-text-tertiary text-sm'>{issue.description}</p>
			<div className='flex flex-col gap-2'>
				<h4 className='text-sm font-medium'>Outcomes:</h4>
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
};
