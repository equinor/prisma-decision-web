import { Button, EdsProvider, Icon, Menu } from '@equinor/eds-core-react';
import { chevron_down, chevron_up, delete_to_trash, edit, more_vertical } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { cn } from '../../../utils/cn';
import { Issue, Option } from '../../../validators';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';
import { sortByCreatedAt } from '../../../utils/sortByCreatedAt';
import { CardContainer } from './CardContainer';
import { DecisionLabel } from './IssueLabel';
import { BoundaryLabel } from './BoundaryLabel';

export const DecisionCard = ({
	issue,
	canExpand = true,
	onClickOption,
	selectedOption,
	onClickOpenPolicyTable,
	expanded: expandedProp,
	...rest
}: DecisionCardProps) => {
	const sortedOptions = sortByCreatedAt(issue.decision.options);
	const hasOptions = sortedOptions.length > 0;
	const { expanded: _expanded, toggle } = useExpandCard(issue.id);
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const expanded = expandedProp ?? _expanded;

	return (
		<CardContainer {...rest} onDoubleClick={() => setEditOpen(true)}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-1'>
					<DecisionLabel />
					<BoundaryLabel boundary={issue.boundary} />
				</div>
				<div className=''>
					<Button
						ref={setAnchorEl}
						onClick={() => setMenuOpen(true)}
						variant='ghost_icon'
						className='nodrag nopan pointer-events-auto'
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
						{onClickOpenPolicyTable && (
							<Menu.Item onClick={onClickOpenPolicyTable}>
								<p>Policy Table</p>
							</Menu.Item>
						)}
					</Menu>
				</div>
			</div>
			<div>
				<h3 className='font-semibold '>{issue.name}</h3>
				<p
					className={cn('text-text-tertiary line-clamp-1 text-sm', {
						'line-clamp-none': canExpand && expanded,
					})}
				>
					{issue.description}
				</p>
			</div>
			{(canExpand || expanded) && (
				<Collapsible
					open={expanded}
					onOpenChange={toggle}
					className={cn({
						'pb-7': canExpand,
					})}
				>
					<CollapsibleContent className='mb-2 w-full' asChild>
						{hasOptions && (
							<ul className='flex flex-col gap-2 rounded-sm text-sm'>
								{sortedOptions.map(option => (
									<li
										onClick={() => onClickOption && onClickOption(option)}
										key={option.id}
										className={cn(
											'bg-background-light pointer-events-auto flex justify-between rounded-sm px-2 py-1',
											{
												'hover:bg-primary-hover-alt cursor-pointer':
													onClickOption,
												'outline-primary-resting outline-2':
													option.id === selectedOption?.id,
											},
										)}
									>
										<p className='truncate'>{option.name}</p>
										<p className='truncate'>{option.utility}</p>
									</li>
								))}
							</ul>
						)}
					</CollapsibleContent>
					<EdsProvider density='compact'>
						{canExpand && (
							<CollapsibleTrigger asChild>
								<button className='nodrag nopan pointer-events-auto absolute right-2 bottom-1 flex cursor-pointer items-center gap-2'>
									<p className='text-text-tertiary text-sm'>
										{sortedOptions.length} Options
									</p>
									<Icon
										className='fill-primary-resting'
										data={expanded ? chevron_up : chevron_down}
									/>
								</button>
							</CollapsibleTrigger>
						)}
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

type DecisionCardProps = {
	issue: Issue;
	onClickOption?: (option: Option) => void;
	selectedOption?: Option;
	onClickOpenPolicyTable?: () => void;
	className?: string;
	canExpand?: boolean;
	expanded?: boolean;
};
