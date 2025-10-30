import { Chip, EdsProvider, Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_up } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { Issue } from '../../../validators';
import { CardContainer } from './CardContainer';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { cn } from '../../../utils/cn';

export const UncertaintyCard = ({ issue, isDecisionTree, ...rest }: UncertaintyCardProps) => {
	const hasOutcomes = issue.uncertainty.outcomes.length > 0;
	const { expanded, toggle } = useExpandCard(issue.id);
	return (
		<CardContainer {...rest}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Uncertainty</Chip>
					<Chip className='capitalize'>{issue.boundary}</Chip>
				</div>
				<div>
					<EditIssueModal issue={issue} />
					<DeleteIssueDialog issue={issue} />
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p
				className={cn('text-text-tertiary  overflow-hidden text-sm', {
					'line-clamp-3': !expanded,
				})}
			>
				{issue.description}
			</p>
			{!isDecisionTree && (
				<Collapsible open={expanded} onOpenChange={toggle} className='pb-4'>
					<CollapsibleContent className='mb-2 w-full' asChild>
						{hasOutcomes && (
							<ul className='flex flex-col gap-2 rounded-sm text-sm'>
								{issue.uncertainty.outcomes.map(outcome => (
									<li
										key={outcome.id}
										className='bg-background-light rounded-sm px-2 py-1'
									>
										<p className='truncate'>{outcome.name}</p>
									</li>
								))}
							</ul>
						)}
					</CollapsibleContent>
					<EdsProvider density='compact'>
						<CollapsibleTrigger asChild>
							<button className='absolute right-2 bottom-2 flex cursor-pointer items-center gap-2'>
								<p className='text-text-tertiary text-sm'>
									{issue.uncertainty.outcomes.length} Outcomes
								</p>
								<Icon
									className='fill-primary-resting'
									data={expanded ? chevron_up : chevron_down}
								/>
							</button>
						</CollapsibleTrigger>
					</EdsProvider>
				</Collapsible>
			)}
		</CardContainer>
	);
};

type UncertaintyCardProps = {
	issue: Issue;
	className?: string;
	isDecisionTree?: boolean;
};
