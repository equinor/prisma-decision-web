import { Chip, EdsProvider, Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_up } from '@equinor/eds-icons';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { CardContainer } from './CardContainer';
import { cn } from '../../../utils/cn';

export const DecisionCard = ({ issue, ...rest }: DecisionCardProps) => {
	const { expanded, toggle } = useExpandCard(issue.id);

	return (
		<CardContainer className={cn(rest.className, 'pb-8')}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Decision</Chip>
					<Chip className='capitalize'>{issue.boundary}</Chip>
				</div>
				<div>
					<EditIssueModal issue={issue} />
					<DeleteIssueDialog issue={issue} />
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className='text-text-tertiary overflow-hidden text-sm'>{issue.description}</p>
			<EdsProvider density='compact'>
				<button
					onClick={toggle}
					className='absolute right-2 bottom-1 flex cursor-pointer items-center gap-2'
				>
					<p className='text-text-tertiary text-sm'>
						{issue.decision.options.length} Options
					</p>
					<Icon
						className='fill-primary-resting'
						data={expanded ? chevron_up : chevron_down}
					/>
				</button>
			</EdsProvider>
		</CardContainer>
	);
};

type DecisionCardProps = {
	issue: Issue;
	className?: string;
};
