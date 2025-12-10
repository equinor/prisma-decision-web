import { Button, EdsProvider, Icon, Menu } from '@equinor/eds-core-react';
import { chevron_down, chevron_up, delete_to_trash, edit, more_vertical } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { CardContainer } from './CardContainer';
import { BoundaryLabel, UncertaintyLabel } from './DecisionLabel';

export const UncertaintyCard = ({
	issue,
	isDecisionTree,
	onClickOpenProbabilities,
	...rest
}: UncertaintyCardProps) => {
	const hasOutcomes = issue.uncertainty.outcomes.length > 0;
	const { expanded, toggle } = useExpandCard(issue.id);
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	return (
		<CardContainer {...rest} onDoubleClick={() => setEditOpen(true)}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<UncertaintyLabel />
					<BoundaryLabel boundary={issue.boundary} />
				</div>
				<div>
					<Button
						ref={setAnchorEl}
						onClick={() => setMenuOpen(true)}
						variant='ghost_icon'
					>
						<Icon data={more_vertical} />
					</Button>
					<Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorEl={anchorEl}>
						<Menu.Item onClick={() => setEditOpen(true)}>
							<Icon data={edit} />
							<p>Edit</p>
						</Menu.Item>
						<Menu.Item onClick={() => setDeleteOpen(true)}>
							<Icon data={delete_to_trash} />
							<p>Delete</p>
						</Menu.Item>
						{onClickOpenProbabilities && (
							<Menu.Item onClick={onClickOpenProbabilities}>
								<p>Probabilities</p>
							</Menu.Item>
						)}
					</Menu>
				</div>
			</div>
			<div>
				<h3 className='font-semibold '>{issue.name}</h3>
				<p
					className={cn('text-text-tertiary  overflow-hidden text-sm', {
						'line-clamp-3': !expanded,
					})}
				>
					{issue.description}
				</p>
			</div>
			{!isDecisionTree && (
				<Collapsible open={expanded} onOpenChange={toggle} className='pb-7'>
					<CollapsibleContent className='mb-2 w-full' asChild>
						{hasOutcomes && (
							<ul className='flex flex-col gap-2 rounded-sm text-sm'>
								{issue.uncertainty.outcomes.map(outcome => (
									<li
										key={outcome.id}
										className='bg-background-light flex justify-between rounded-sm px-2 py-1'
									>
										<p className='truncate'>{outcome.name}</p>
										<p className='truncate'>{outcome.utility}</p>
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
			<EditIssueModal issue={issue} open={editOpen} onClose={() => setEditOpen(false)} />
			<DeleteIssueDialog
				issue={issue}
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
			/>
		</CardContainer>
	);
};

type UncertaintyCardProps = {
	issue: Issue;
	className?: string;
	isDecisionTree?: boolean;
	onClickOpenProbabilities?: () => void;
};
