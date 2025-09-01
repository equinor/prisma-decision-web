import { Chip, Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_up } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { CardContainer } from './CardContainer';

export const DecisionCard = ({ issue, ...rest }: DecisionCardProps) => {
	const hasOptions = issue.decision.options.length > 0;
	const { expanded, toggle } = useExpandCard(issue.id);
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

type DecisionCardProps = {
	issue: Issue;
	className?: string;
};
