import { Button, Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_up, link } from '@equinor/eds-icons';
import { PointerEvent, ReactNode, useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { Objective } from '../../../../validators';
import { ConnectorGlyph } from '../../../common/ConnectorGlyph';
import { ObjectivePickerMenu } from './ObjectivePickerMenu';
import { ObjectiveTypeBadge } from './ObjectiveTypeBadge';

export type ObjectiveCardState = 'default' | 'connectionSource' | 'dropCandidate' | 'dropHover';

// 'child': right side, links to a supporting objective. 'parent': left side, links to one it contributes to.
export type ConnectorDirection = 'child' | 'parent';

type ObjectiveCardProps = {
	objective: Objective;
	state: ObjectiveCardState;
	dimmed: boolean;
	highlighted: boolean;
	expanded: boolean;
	parentCount: number;
	connecting: boolean;
	isDragSource: boolean;
	activeConnector: ConnectorDirection | null;
	// Undefined when the objective's level has no children / parents
	childOptions?: Objective[];
	parentOptions?: Objective[];
	panel: ReactNode;
	onToggleExpanded: () => void;
	// Dragging the title row moves the objective to another column (reclassifies it)
	onDragHandlePointerDown: (event: PointerEvent) => void;
	onConnectorPointerDown: (
		event: PointerEvent,
		direction: ConnectorDirection,
		openMenu: () => void,
	) => void;
	onLinkChild: (childId: string) => void;
	onLinkParent: (parentId: string) => void;
};

export const ObjectiveCard = ({
	objective,
	state,
	dimmed,
	highlighted,
	expanded,
	parentCount,
	connecting,
	isDragSource,
	activeConnector,
	childOptions,
	parentOptions,
	panel,
	onToggleExpanded,
	onDragHandlePointerDown,
	onConnectorPointerDown,
	onLinkChild,
	onLinkParent,
}: ObjectiveCardProps) => {
	const isConnectionSource = state === 'connectionSource';

	const connectorProps = (direction: ConnectorDirection) => ({
		objective,
		direction,
		expanded,
		active: activeConnector === direction,
		hidden: connecting && activeConnector !== direction,
		onPointerDown: (event: PointerEvent, openMenu: () => void) =>
			onConnectorPointerDown(event, direction, openMenu),
	});

	return (
		<div
			data-objective-id={objective.id}
			className={cn('group/node relative z-20 w-full cursor-pointer', {
				'opacity-40': dimmed || isDragSource,
			})}
			onClick={event => {
				event.stopPropagation();
				onToggleExpanded();
			}}
		>
			{parentOptions && (
				<CardConnector
					{...connectorProps('parent')}
					options={parentOptions}
					onPick={onLinkParent}
				/>
			)}
			{childOptions && (
				<CardConnector
					{...connectorProps('child')}
					options={childOptions}
					onPick={onLinkChild}
				/>
			)}
			<div
				className={cn(
					`bg-background-default relative z-10 flex flex-col rounded-sm border-2
					border-transparent shadow-[0px_2px_2px_rgba(0,0,0,0.14),0px_3px_2px_rgba(0,0,0,0.12)]`,
					{
						'border-diagram-connector': isConnectionSource || state === 'dropHover',
						'border-accent-border bg-accent-canvas border-dashed':
							state === 'dropCandidate',
						'bg-accent-canvas': state === 'dropHover' || highlighted,
						'shadow-[0px_2px_4px_rgba(0,0,0,0.14),0px_3px_4px_rgba(0,0,0,0.12)]':
							expanded,
					},
				)}
			>
				<div
					data-objective-anchor
					className='flex cursor-grab touch-none items-center gap-2 py-1.5 pr-2.5 pl-1.5'
					onPointerDown={event => {
						if (event.target instanceof Element && event.target.closest('button'))
							return;
						onDragHandlePointerDown(event);
					}}
				>
					<ObjectiveTypeBadge type={objective.type} />
					<p className='min-w-16 flex-1 text-sm leading-5 font-medium break-words'>
						{objective.name}
					</p>
					{parentCount > 1 && (
						<span
							className='text-text-tertiary flex shrink-0 items-center gap-0.5 text-xs font-medium'
							title={`Supports ${parentCount} objectives`}
						>
							<Icon data={link} size={16} className='fill-text-tertiary' />
							{parentCount}
						</span>
					)}
					<Button
						variant='ghost_icon'
						className={cn('-my-1 size-8!', {
							'opacity-0 group-hover/node:opacity-100 focus-visible:opacity-100':
								!expanded,
						})}
						aria-label={
							expanded ? `Collapse ${objective.name}` : `Expand ${objective.name}`
						}
						aria-expanded={expanded}
						onClick={event => {
							event.stopPropagation();
							onToggleExpanded();
						}}
					>
						<Icon data={expanded ? chevron_up : chevron_down} size={18} />
					</Button>
				</div>
				{expanded && panel}
			</div>
		</div>
	);
};

type CardConnectorProps = {
	objective: Objective;
	direction: ConnectorDirection;
	expanded: boolean;
	active: boolean;
	hidden: boolean;
	options: Objective[];
	onPointerDown: (event: PointerEvent, openMenu: () => void) => void;
	onPick: (objectiveId: string) => void;
};

// Hover handle beside the card: drag onto a card in the neighbouring column, or click to pick one
const CardConnector = ({
	objective,
	direction,
	expanded,
	active,
	hidden,
	options,
	onPointerDown,
	onPick,
}: CardConnectorProps) => {
	const ref = useRef<HTMLButtonElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const isChild = direction === 'child';
	const title = isChild ? 'Supported by' : 'Contributes to';

	return (
		<>
			<button
				ref={ref}
				type='button'
				aria-label={
					isChild
						? `Link ${objective.name} to a supporting objective`
						: `Link ${objective.name} to an objective it contributes to`
				}
				className={cn(
					`group/connector absolute flex h-11.5 w-12 -translate-y-1/2 cursor-pointer
					touch-none items-center`,
					isChild ? 'left-full justify-start pl-2' : 'right-full justify-end pr-2',
					expanded ? 'top-6' : 'top-1/2',
					{ 'pointer-events-none opacity-0': hidden },
				)}
				onPointerDown={event => onPointerDown(event, () => setMenuOpen(true))}
				onClick={event => event.stopPropagation()}
			>
				<ConnectorGlyph open={menuOpen || active} side={isChild ? 'right' : 'left'} />
			</button>
			{menuOpen && (
				<ObjectivePickerMenu
					anchorEl={ref.current}
					title={title}
					options={options}
					placement={isChild ? 'right-start' : 'left-start'}
					onPick={onPick}
					onClose={() => setMenuOpen(false)}
				/>
			)}
		</>
	);
};
