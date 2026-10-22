import { Button, Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_up, link } from '@equinor/eds-icons';
import { PointerEvent, ReactNode } from 'react';
import { cn } from '../../../../utils/cn';
import { Objective } from '../../../../validators';
import { ConnectorDirection, ObjectiveConnector } from './ObjectiveConnector';
import { ObjectiveTypeBadge } from './ObjectiveTypeBadge';

export type ObjectiveCardState = 'default' | 'connectionSource' | 'dropCandidate' | 'dropHover';

type ObjectiveCardProps = {
	objective: Objective;
	state: ObjectiveCardState;
	dimmed: boolean;
	highlighted: boolean;
	// Content = description + actions (chevron), connections = link lists (link-count toggle)
	contentOpen: boolean;
	connectionsOpen: boolean;
	linkCount: number;
	connecting: boolean;
	isDragSource: boolean;
	activeConnector: ConnectorDirection | null;
	// Undefined when the objective's level has no children / parents
	childOptions?: Objective[];
	parentOptions?: Objective[];
	panel: ReactNode;
	onToggleContent: () => void;
	onToggleConnections: () => void;
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
	contentOpen,
	connectionsOpen,
	linkCount,
	connecting,
	isDragSource,
	activeConnector,
	childOptions,
	parentOptions,
	panel,
	onToggleContent,
	onToggleConnections,
	onDragHandlePointerDown,
	onConnectorPointerDown,
	onLinkChild,
	onLinkParent,
}: ObjectiveCardProps) => {
	const isConnectionSource = state === 'connectionSource';
	const expanded = contentOpen || connectionsOpen;
	const revealClassName = cn(
		'focus-visible:opacity-100 group-focus-within/node:opacity-100 group-hover/node:opacity-100',
		{ 'opacity-0': !expanded },
	);

	const connectorProps = (direction: ConnectorDirection) => ({
		objective,
		direction,
		side: direction === 'child' ? ('right' as const) : ('left' as const),
		topClassName: expanded ? 'top-6' : 'top-1/2',
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
				onToggleContent();
			}}
		>
			{parentOptions && (
				<ObjectiveConnector
					{...connectorProps('parent')}
					options={parentOptions}
					onPick={onLinkParent}
				/>
			)}
			{childOptions && (
				<ObjectiveConnector
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
					<button
						type='button'
						aria-label={`${linkCount} connections`}
						aria-expanded={connectionsOpen}
						title={connectionsOpen ? 'Hide connections' : 'Show connections'}
						className={cn(
							`text-primary-resting hover:bg-tier-fill -my-1 flex shrink-0 cursor-pointer
							items-center gap-1.5 rounded-sm px-3 py-2 text-xs leading-4 font-medium`,
							{ 'bg-tier-fill-hover!': connectionsOpen },
							revealClassName,
						)}
						onClick={event => {
							event.stopPropagation();
							onToggleConnections();
						}}
					>
						<Icon data={link} size={16} className='fill-primary-resting' />
						{linkCount}
					</button>
					<Button
						variant='ghost_icon'
						className={cn('-my-1 size-8!', revealClassName)}
						aria-label={
							contentOpen ? `Collapse ${objective.name}` : `Expand ${objective.name}`
						}
						aria-expanded={contentOpen}
						onClick={event => {
							event.stopPropagation();
							onToggleContent();
						}}
					>
						<Icon data={contentOpen ? chevron_up : chevron_down} size={18} />
					</Button>
				</div>
				{expanded && panel}
			</div>
		</div>
	);
};
