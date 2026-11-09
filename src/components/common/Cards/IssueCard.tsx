import { Menu } from '@equinor/eds-core-react';
import { Button as BetaButton, Icon as BetaIcon } from '@equinor/eds-core-react/next';
import {
	chevron_down,
	chevron_up,
	delete_to_trash,
	edit,
	functions,
	more_vertical,
} from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { useIssueClassification } from '../../../hooks/useIssueClassification';
import { percentageIcon } from '../../../icons';
import { cn } from '../../../utils/cn';
import { sortByCreatedAt } from '../../../utils/sortByCreatedAt';
import { Issue, Option, Outcome } from '../../../validators';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';
import { IssueTypeIcon } from '../IssueTypeIcon';
import { BoundaryLabel } from './BoundaryLabel';
import { CardContainer } from './CardContainer';
import { DecisionTypeLabel } from './DecisionTypeLabel';
import { IssueTypeLabel } from './IssueTypeLabel';
import { KeyLabel } from './KeyLabel';
import { IssueCardContext, useIssueCardContext } from './useIssueCardContext';
import { useIssueCardPointerInteraction } from './useIssueCardPointerInteraction';

type IssueCardProps = {
	issue: Issue;
	onClickState?: (state: Option | Outcome) => void;
	selectedState?: Option | Outcome;
	children: React.ReactNode;
	className?: string;
	selected?: boolean;
	expandWidth?: boolean;
	includeBorder?: boolean;
};

export const IssueCard = ({
	children,
	issue,
	onClickState,
	selectedState,
	className,
	...rest
}: IssueCardProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const pointerInteraction = useIssueCardPointerInteraction();
	const sortedStates =
		issue.type === 'Uncertainty'
			? sortByCreatedAt(issue.uncertainty.outcomes)
			: issue.type === 'Decision'
				? sortByCreatedAt(issue.decision.options)
				: [];
	return (
		<IssueCardContext
			value={{ issue, sortedStates, setEditOpen, setDeleteOpen, onClickState, selectedState }}
		>
			<CardContainer
				{...rest}
				{...pointerInteraction}
				className={cn('gap-0', className)}
				issueType={issue.type}
			>
				{children}
			</CardContainer>
			<EditIssueModal issue={issue} open={editOpen} onClose={() => setEditOpen(false)} />
			<DeleteIssueDialog
				issue={issue}
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
			/>
		</IssueCardContext>
	);
};

export const IssueCardMenu = ({ children }: { children: React.ReactNode }) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	return (
		<div className='flex shrink-0 p-0.5'>
			<BetaButton
				ref={setAnchorEl}
				onClick={() => setMenuOpen(true)}
				variant='ghost'
				size='small'
				icon
				aria-label='Issue actions'
				data-card-action
				className='pointer-events-auto'
			>
				<BetaIcon data={more_vertical} size='md' />
			</BetaButton>
			<Menu
				open={menuOpen}
				onClose={() => setMenuOpen(false)}
				anchorEl={anchorEl}
				className='nodrag nopan nowheel'
			>
				{children}
			</Menu>
		</div>
	);
};

export const IssueCardEditMenuItem = () => {
	const { setEditOpen } = useIssueCardContext();
	return (
		<Menu.Item onClick={() => setEditOpen(true)}>
			<BetaIcon data={edit} size='md' className='size-5!' />
			<p>Edit</p>
		</Menu.Item>
	);
};

export const IssueCardDeleteMenuItem = () => {
	const { setDeleteOpen } = useIssueCardContext();
	return (
		<Menu.Item onClick={() => setDeleteOpen(true)}>
			<BetaIcon data={delete_to_trash} size='md' className='size-5!' />
			<p>Delete</p>
		</Menu.Item>
	);
};

export const IssueCardProbabilityTableMenuItem = ({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled?: boolean;
}) => {
	return (
		<Menu.Item onClick={onClick} disabled={disabled}>
			<BetaIcon data={percentageIcon} size='md' className='ml-1 size-5!' />
			<p>Probabilities</p>
		</Menu.Item>
	);
};

export const IssueCardUtilityTableMenuItem = ({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled?: boolean;
}) => {
	return (
		<Menu.Item onClick={onClick} disabled={disabled}>
			<IssueTypeIcon type='Utility' />
			<p>Utility Table</p>
		</Menu.Item>
	);
};

export const IssueCardPolicyTableMenuItem = ({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled?: boolean;
}) => {
	return (
		<Menu.Item onClick={onClick} disabled={disabled}>
			<BetaIcon data={functions} size='md' className='size-5!' />
			<p>Policy Table</p>
		</Menu.Item>
	);
};

export const IssueCardHeader = ({
	children,
	editable = false,
}: {
	children?: React.ReactNode;
	editable?: boolean;
}) => {
	const { issue } = useIssueCardContext();
	const { changeType, changeDecisionType, changeBoundary, toggleKey } =
		useIssueClassification(issue);
	return (
		<div className='flex items-center justify-between'>
			<div className='flex min-w-0 flex-1 flex-wrap items-start gap-1 py-1.5'>
				<IssueTypeLabel type={issue.type} onChange={editable ? changeType : undefined} />
				<BoundaryLabel
					boundary={issue.boundary}
					onChange={editable ? changeBoundary : undefined}
				/>
				{issue.type === 'Decision' && (
					<DecisionTypeLabel
						type={issue.decision.type}
						onChange={editable ? changeDecisionType : undefined}
					/>
				)}
				{issue.type === 'Uncertainty' && (
					<KeyLabel
						isKey={issue.uncertainty.is_key}
						onChange={editable ? toggleKey : undefined}
					/>
				)}
			</div>
			{children}
		</div>
	);
};

export const IssueCardContent = ({
	descriptionClassName,
	nameClassName,
}: {
	descriptionClassName?: string;
	nameClassName?: string;
}) => {
	const { issue } = useIssueCardContext();
	return (
		<div className='pb-1'>
			<h3 className={cn('text-text-default text-base leading-6 font-bold', nameClassName)}>
				{issue.name}
			</h3>
			<p
				className={cn(
					'text-text-tertiary line-clamp-1 text-sm leading-5',
					descriptionClassName,
				)}
			>
				{issue.description}
			</p>
		</div>
	);
};

export const IssueCardExpandableContent = ({ expandedProp }: { expandedProp?: boolean }) => {
	const { issue } = useIssueCardContext();
	const { expanded: _expanded } = useExpandCard(issue.id);
	const expanded = expandedProp ?? _expanded;
	return (
		<div className='pb-1'>
			<h3 className='text-text-default text-base leading-6 font-bold'>{issue.name}</h3>
			<p
				className={cn('text-text-tertiary line-clamp-1 text-sm leading-5', {
					'line-clamp-none': expanded,
				})}
			>
				{issue.description}
			</p>
		</div>
	);
};

export const IssueCardStates = ({
	children,
	expandedProp,
}: {
	children?: React.ReactNode;
	expandedProp?: boolean;
}) => {
	const { issue, onClickState, selectedState, sortedStates } = useIssueCardContext();
	const { expanded: _expanded, toggle } = useExpandCard(issue.id);
	const expanded = expandedProp ?? _expanded;

	if (issue.type !== 'Decision' && issue.type !== 'Uncertainty') return null;

	const hasOptions = sortedStates.length > 0;

	return (
		<Collapsible open={expanded} onOpenChange={toggle} className='flex flex-1 flex-col'>
			<CollapsibleContent className='mb-2 w-full pt-2' asChild>
				{hasOptions && (
					<ul className='flex flex-col gap-2 rounded-sm text-sm leading-5'>
						{sortedStates.map(option => {
							return (
								<IssueCardState
									onClick={() => onClickState?.(option)}
									key={option.id}
									className={cn(
										'bg-background-light pointer-events-auto flex justify-between rounded-sm px-2 py-1',
										{
											'hover:bg-primary-hover-alt cursor-pointer':
												onClickState,
											'outline-primary-resting outline-2':
												option.id === selectedState?.id,
										},
									)}
								>
									<p className='truncate'>{option.name}</p>
									<p className='truncate'>{option.utility}</p>
								</IssueCardState>
							);
						})}
					</ul>
				)}
			</CollapsibleContent>
			{children}
		</Collapsible>
	);
};

export const IssueCardState = ({
	className,
	children,
	...rest
}: {
	className?: string;
	children: React.ReactNode;
} & React.HTMLAttributes<HTMLLIElement>) => {
	return (
		<li
			className={cn(
				className,
				'bg-background-light pointer-events-auto flex justify-between rounded-sm px-2 py-1',
			)}
			{...rest}
		>
			{children}
		</li>
	);
};

export const IssueCardExpandTrigger = () => {
	const { issue, sortedStates } = useIssueCardContext();
	const { expanded } = useExpandCard(issue.id);
	if (issue.type !== 'Decision' && issue.type !== 'Uncertainty') return null;
	return (
		<CollapsibleTrigger asChild>
			<BetaButton
				variant='ghost'
				size='small'
				data-card-action
				className='text-text-tertiary! pointer-events-auto mt-auto self-end px-1.5!'
			>
				{sortedStates.length} States
				<BetaIcon
					className='text-primary-resting'
					data={expanded ? chevron_up : chevron_down}
				/>
			</BetaButton>
		</CollapsibleTrigger>
	);
};
