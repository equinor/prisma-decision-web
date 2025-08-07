import { Chip } from '@equinor/eds-core-react';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';

export const FactCard = ({ issue }: FactCardProps) => {
	return (
		<div
			className='bg-background-default shadow-tile outline-primary-resting
			flex w-full max-w-[440px] cursor-grab flex-col gap-2 rounded-sm p-4'
		>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Fact</Chip>
					<Chip>{issue.boundary}</Chip>
				</div>
				<div>
					<EditIssueModal issue={issue} />
					<DeleteIssueDialog issue={issue} />
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className='text-text-tertiary text-sm'>{issue.description}</p>
		</div>
	);
};

type FactCardProps = {
	issue: Issue;
};
