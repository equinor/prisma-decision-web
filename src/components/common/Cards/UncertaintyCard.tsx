import { Button, EdsProvider, Icon, Menu } from '@equinor/eds-core-react';
import {
	chevron_down,
	chevron_up,
	delete_to_trash,
	edit,
	IconData,
	more_vertical,
} from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { CardContainer } from './CardContainer';
import { UncertaintyLabel } from './IssueLabel';
import { BoundaryLabel } from './BoundaryLabel';

const percentageIcon: IconData = {
	height: '16',
	prefix: 'custom',
	width: '16',
	name: 'percentage',
	svgPathData:
		'M3.5 7C2.53333 7 1.70833 6.65833 1.025 5.975C0.341667 5.29167 0 4.46667 0 3.5C0 2.53333 0.341667 1.70833 1.025 1.025C1.70833 0.341667 2.53333 0 3.5 0C4.46667 0 5.29167 0.341667 5.975 1.025C6.65833 1.70833 7 2.53333 7 3.5C7 4.46667 6.65833 5.29167 5.975 5.975C5.29167 6.65833 4.46667 7 3.5 7ZM3.5 5C3.91667 5 4.27083 4.85417 4.5625 4.5625C4.85417 4.27083 5 3.91667 5 3.5C5 3.08333 4.85417 2.72917 4.5625 2.4375C4.27083 2.14583 3.91667 2 3.5 2C3.08333 2 2.72917 2.14583 2.4375 2.4375C2.14583 2.72917 2 3.08333 2 3.5C2 3.91667 2.14583 4.27083 2.4375 4.5625C2.72917 4.85417 3.08333 5 3.5 5ZM12.5 16C11.5333 16 10.7083 15.6583 10.025 14.975C9.34167 14.2917 9 13.4667 9 12.5C9 11.5333 9.34167 10.7083 10.025 10.025C10.7083 9.34167 11.5333 9 12.5 9C13.4667 9 14.2917 9.34167 14.975 10.025C15.6583 10.7083 16 11.5333 16 12.5C16 13.4667 15.6583 14.2917 14.975 14.975C14.2917 15.6583 13.4667 16 12.5 16ZM12.5 14C12.9167 14 13.2708 13.8542 13.5625 13.5625C13.8542 13.2708 14 12.9167 14 12.5C14 12.0833 13.8542 11.7292 13.5625 11.4375C13.2708 11.1458 12.9167 11 12.5 11C12.0833 11 11.7292 11.1458 11.4375 11.4375C11.1458 11.7292 11 12.0833 11 12.5C11 12.9167 11.1458 13.2708 11.4375 13.5625C11.7292 13.8542 12.0833 14 12.5 14ZM1.4 16L0 14.6L14.6 0L16 1.4L1.4 16Z',
};

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
								<Icon data={percentageIcon} className='ml-1' />
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
