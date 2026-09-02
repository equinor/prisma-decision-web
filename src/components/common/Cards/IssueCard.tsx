import { Button, EdsProvider, Icon, Menu } from '@equinor/eds-core-react';
import { chevron_down, chevron_up, delete_to_trash, edit, more_vertical } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { createContext, use, useState } from 'react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { percentageIcon, utilityIcon } from '../../../icons';
import { cn } from '../../../utils/cn';
import { sortByCreatedAt } from '../../../utils/sortByCreatedAt';
import { Issue, Option, Outcome } from '../../../validators';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';
import { BoundaryLabel } from './BoundaryLabel';
import { CardContainer } from './CardContainer';
import { IssueTypeLabel } from './IssueTypeLabel';

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

type IssueCardContextType = {
	issue: Issue;
	sortedStates: Option[] | Outcome[];
	setEditOpen: (open: boolean) => void;
	setDeleteOpen: (open: boolean) => void;
	selectedState?: Option | Outcome;
	onClickState?: (state: Option | Outcome) => void;
};

const IssueCardContext = createContext<IssueCardContextType | null>(null);
const useIssueCardContext = () => {
	const context = use(IssueCardContext);
	if (!context) {
		throw new Error('useIssueCardContext must be used within an IssueCardContext.Provider');
	}
	return context;
};

export const IssueCard = ({
	children,
	issue,
	onClickState,
	selectedState,
	...rest
}: IssueCardProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const sortedStates =
		issue.type === 'Uncertainty'
			? sortByCreatedAt(issue.uncertainty.outcomes)
			: sortByCreatedAt(issue.decision.options);
	return (
		<IssueCardContext
			value={{ issue, sortedStates, setEditOpen, setDeleteOpen, onClickState, selectedState }}
		>
			<CardContainer {...rest} issueType={issue.type}>
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
		<div>
			<Button
				ref={setAnchorEl}
				onClick={() => setMenuOpen(true)}
				variant='ghost_icon'
				className='nodrag nopan pointer-events-auto'
			>
				<Icon data={more_vertical} />
			</Button>
			<Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorEl={anchorEl}>
				{children}
			</Menu>
		</div>
	);
};

export const IssueCardEditMenuItem = () => {
	const { setEditOpen } = useIssueCardContext();
	return (
		<Menu.Item onClick={() => setEditOpen(true)}>
			<Icon data={edit} />
			<p>Edit</p>
		</Menu.Item>
	);
};

export const IssueCardDeleteMenuItem = () => {
	const { setDeleteOpen } = useIssueCardContext();
	return (
		<Menu.Item onClick={() => setDeleteOpen(true)}>
			<Icon data={delete_to_trash} />
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
			<Icon data={percentageIcon} className='ml-1' />
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
			<Icon data={utilityIcon} className='ml-1' />
			<p>Utility Table</p>
		</Menu.Item>
	);
};

export const IssueCardHeader = ({ children }: { children?: React.ReactNode }) => {
	const { issue } = useIssueCardContext();
	return (
		<div className='flex items-center justify-between'>
			<div className='flex gap-1'>
				<IssueTypeLabel type={issue.type} />
				<BoundaryLabel boundary={issue.boundary} />
			</div>
			{children}
		</div>
	);
};

export const IssueCardContent = ({ descriptionClassName }: { descriptionClassName?: string }) => {
	const { issue } = useIssueCardContext();
	return (
		<div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className={cn('text-text-tertiary line-clamp-1 text-sm', descriptionClassName)}>
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
		<div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p
				className={cn('text-text-tertiary line-clamp-1 text-sm', {
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
	disabledStateIds,
}: {
	children?: React.ReactNode;
	expandedProp?: boolean;
	disabledStateIds?: readonly string[];
}) => {
	const { issue, onClickState, selectedState, sortedStates } = useIssueCardContext();
	const { expanded: _expanded, toggle } = useExpandCard(issue.id);
	const expanded = expandedProp ?? _expanded;

	const hasOptions = sortedStates.length > 0;

	return (
		<Collapsible open={expanded} onOpenChange={toggle} className=''>
			<CollapsibleContent className='mb-2 w-full' asChild>
				{hasOptions && (
					<ul className='flex flex-col gap-2 rounded-sm text-sm'>
						{sortedStates.map(option => {
							const disabled =
								disabledStateIds?.includes(option.id) &&
								option.id !== selectedState?.id;
							return (
								<li
									onClick={() => !disabled && onClickState?.(option)}
									key={option.id}
									className={cn(
										'bg-background-light pointer-events-auto flex justify-between rounded-sm px-2 py-1',
										{
											'hover:bg-primary-hover-alt cursor-pointer':
												onClickState && !disabled,
											'cursor-not-allowed opacity-50': disabled,
											'outline-primary-resting outline-2':
												option.id === selectedState?.id,
										},
									)}
								>
									<p className='truncate'>{option.name}</p>
									<p className='truncate'>{option.utility}</p>
								</li>
							);
						})}
					</ul>
				)}
			</CollapsibleContent>
			{children}
		</Collapsible>
	);
};

export const IssueCardExpandTrigger = () => {
	const { issue, sortedStates } = useIssueCardContext();
	const { expanded } = useExpandCard(issue.id);
	return (
		<EdsProvider density='compact'>
			<CollapsibleTrigger asChild>
				<button className='nodrag nopan pointer-events-auto ml-auto flex cursor-pointer items-center gap-2'>
					<p className='text-text-tertiary text-sm'>{sortedStates.length} States</p>
					<Icon
						className='fill-primary-resting'
						data={expanded ? chevron_up : chevron_down}
					/>
				</button>
			</CollapsibleTrigger>
		</EdsProvider>
	);
};
