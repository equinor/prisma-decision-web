import { Chip } from '@equinor/eds-core-react';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { CardContainer } from './CardContainer';

export const DecisionCard = ({ issue, ...rest }: DecisionCardProps) => {
	const hasOptions = issue.decision.options.length > 0;
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
				{hasOptions && (
					<ul className='flex flex-col gap-2 text-sm'>
						{issue.decision.options.map(option => (
							<li
								key={option.id}
								className='bg-background-light flex justify-between rounded-sm px-2 py-1'
							>
								<p>{option.name}</p>
								<p>{option.utility}</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</CardContainer>
	);
};

type DecisionCardProps = {
	issue: Issue;
	className?: string;
};
