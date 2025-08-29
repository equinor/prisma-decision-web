import { Chip, Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_up } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { CardContainer } from './CardContainer';

export const UncertaintyCard = ({ issue, ...rest }: UncertaintyCardProps) => {
	const hasOutcomes = issue.uncertainty.outcomes.length > 0;
	const { expanded, toggle } = useExpandCard(issue.id);
	return (
		<CardContainer {...rest}>
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
			<Collapsible
				open={expanded}
				onOpenChange={toggle}
				className='flex flex-col items-center justify-center'
			>
				<CollapsibleContent
					className='data-[state=open]:animate-slide-down
					data-[state=closed]:animate-slide-up w-full overflow-hidden'
				>
					<div className='mb-2 flex flex-col'>
						{hasOutcomes && (
							<ul className='flex flex-col gap-2 rounded-sm text-sm'>
								{issue.uncertainty.outcomes.map(outcome => (
									<li
										key={outcome.id}
										className='bg-background-light grid grid-cols-[1fr_1fr_1fr]
										items-center justify-end gap-2 rounded-sm px-2 py-1'
									>
										<p className='truncate'>{outcome.name}</p>
										<p className='place-self-center truncate'>
											{outcome.probability * 100}%
										</p>
										<p className='place-self-end truncate'>{outcome.utility}</p>
									</li>
								))}
							</ul>
						)}
					</div>
				</CollapsibleContent>
				<CollapsibleTrigger className='hover:bg-primary-hover-alt rounded-full p-1'>
					<Icon
						data={expanded ? chevron_up : chevron_down}
						className='fill-primary-resting'
					/>
				</CollapsibleTrigger>
			</Collapsible>
		</CardContainer>
	);
};

type UncertaintyCardProps = {
	issue: Issue;
	className?: string;
};
