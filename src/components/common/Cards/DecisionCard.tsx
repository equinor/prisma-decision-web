import { Chip } from '@equinor/eds-core-react';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { CardContainer } from './CardContainer';

export const DecisionCard = ({ issue, ...rest }: DecisionCardProps) => {
	return (
		<CardContainer {...rest}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Decision</Chip>
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
				<h4 className='text-sm font-medium'>Alternatives:</h4>
				<ul className='flex flex-col gap-2 text-sm'>
					<li className='bg-background-light rounded-sm px-2 py-1'>Option 1</li>
					<li className='bg-background-light rounded-sm px-2 py-1'>Option 2</li>
					<li className='bg-background-light rounded-sm px-2 py-1'>Option 3</li>
				</ul>
			</div>
		</CardContainer>
	);
};

type DecisionCardProps = {
	issue: Issue;
	className?: string;
};
