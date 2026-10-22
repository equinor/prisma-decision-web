import {
	PointerEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	childObjectiveType,
	filterValidLinks,
	objectiveTypeLabel,
	parentObjectiveType,
	useObjectiveLinks,
} from '../../../../hooks/useObjectiveLinks';
import { useSelectedProjectObjectives } from '../../../../hooks/useSelectedProjectObjectives';
import { buildRoundedPolylinePath } from '../../../../utils/buildRoundedPolylinePath';
import { cn } from '../../../../utils/cn';
import {
	buildObjectiveForest,
	layoutObjectiveTree,
	ObjectiveTreeNode,
} from '../../../../utils/layoutObjectiveTree';
import { orderObjectivesByLinks } from '../../../../utils/orderObjectivesByLinks';
import { Objective, ObjectiveType } from '../../../../validators';
import { ObjectiveCardState } from './ObjectiveCard';
import { ConnectorDirection, ObjectiveConnector } from './ObjectiveConnector';
import { ObjectiveTypeBadge } from './ObjectiveTypeBadge';

const levelTypes: ObjectiveType[] = ['Strategic', 'Fundamental', 'Mean'];
const nodeWidth = 200;
const defaultNodeHeight = 40;
const dragThreshold = 4;

type RowBox = { x: number; y: number };
type Point = { x: number; y: number };
type PendingConnection = {
	sourceKey: string;
	sourceId: string;
	direction: ConnectorDirection;
	pointer: Point;
	targetKey: string | null;
};

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const flatten = (nodes: ObjectiveTreeNode[]): ObjectiveTreeNode[] =>
	nodes.flatMap(node => [node, ...flatten(node.children)]);

// Vertical counterpart of the board's bezier: direction 1 leaves downwards, -1 upwards
const buildVerticalBezierPath = (
	[x1, y1]: [number, number],
	[x2, y2]: [number, number],
	direction: 1 | -1,
) => {
	const bend = Math.max(Math.abs(y2 - y1) / 2, 24) * direction;
	return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
};

// Top-down tree: each objective is shown once, under its primary parent
export const ObjectiveTree = () => {
	const { selectedObjectives: objectives } = useSelectedProjectObjectives();
	const { links: storedLinks, addLink } = useObjectiveLinks();
	const boardRef = useRef<HTMLDivElement>(null);
	const [heights, setHeights] = useState<Record<string, number>>({});
	const [rowBoxes, setRowBoxes] = useState<Partial<Record<ObjectiveType, RowBox>>>({});
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [connection, setConnection] = useState<PendingConnection | null>(null);

	const objectivesById = useMemo(
		() => new Map(objectives.map(objective => [objective.id, objective])),
		[objectives],
	);
	const links = useMemo(
		() => filterValidLinks(storedLinks, objectivesById),
		[storedLinks, objectivesById],
	);
	const ordered = useMemo(() => orderObjectivesByLinks(objectives, links), [objectives, links]);
	const forest = useMemo(() => buildObjectiveForest(ordered, links), [ordered, links]);
	const nodes = useMemo(() => flatten(forest), [forest]);
	const nodesByKey = useMemo(() => new Map(nodes.map(node => [node.key, node])), [nodes]);

	const layout = useMemo(
		() => layoutObjectiveTree(forest, () => nodeWidth, { nodeGap: 16, treeGap: 48 }),
		[forest],
	);
	const heightOf = (objectiveId: string) => heights[objectiveId] ?? defaultNodeHeight;
	const rowHeight = (type: ObjectiveType) =>
		Math.max(
			defaultNodeHeight,
			...nodes
				.filter(node => node.objective.type === type)
				.map(node => heightOf(node.objective.id)),
		);

	const measure = useCallback(() => {
		const board = boardRef.current;
		if (!board) return;
		const origin = board.getBoundingClientRect();
		const nextHeights: Record<string, number> = {};
		board.querySelectorAll<HTMLElement>('[data-tree-objective]').forEach(node => {
			nextHeights[node.dataset.treeObjective!] = Math.round(node.offsetHeight);
		});
		setHeights(current => (sameJson(current, nextHeights) ? current : nextHeights));

		const nextBoxes: Partial<Record<ObjectiveType, RowBox>> = {};
		board.querySelectorAll<HTMLElement>('[data-tree-row]').forEach(row => {
			const rect = row.getBoundingClientRect();
			nextBoxes[row.dataset.treeRow as ObjectiveType] = {
				x: Math.round(rect.left - origin.left),
				y: Math.round(rect.top - origin.top),
			};
		});
		setRowBoxes(current => (sameJson(current, nextBoxes) ? current : nextBoxes));
	}, []);

	useLayoutEffect(measure, [measure, nodes, heights]);

	useEffect(() => {
		const board = boardRef.current;
		if (!board) return;
		const observer = new ResizeObserver(measure);
		observer.observe(board);
		return () => observer.disconnect();
	}, [measure]);

	// Primary links are org-chart connectors (down, along a shared line between the rows, down);
	// links to other parents are curves so they don't merge into another parent's line
	const edges = links.flatMap(link => {
		const parent = nodesByKey.get(link.parent_id);
		const child = nodesByKey.get(link.child_id);
		const parentRow = parent && rowBoxes[parent.objective.type];
		const childRow = child && rowBoxes[child.objective.type];
		if (!parent || !child || !parentRow || !childRow) return [];
		const startX = parentRow.x + layout.offsets[parent.key] + nodeWidth / 2;
		const startY = parentRow.y + heightOf(parent.objective.id);
		const endX = childRow.x + layout.offsets[child.key] + nodeWidth / 2;
		const endY = childRow.y;
		const busY = (parentRow.y + rowHeight(parent.objective.type) + endY) / 2;
		return [
			{
				key: link.id,
				objectiveIds: [parent.objective.id, child.objective.id],
				path:
					child.parentKey === parent.key
						? buildRoundedPolylinePath(
								[
									[startX, startY],
									[startX, busY],
									[endX, busY],
									[endX, endY],
								],
								6,
							)
						: buildVerticalBezierPath([startX, startY], [endX, endY], 1),
			},
		];
	});

	const canLink = (parentId: string, childId: string) => {
		const parent = objectivesById.get(parentId);
		const child = objectivesById.get(childId);
		if (!parent || !child || childObjectiveType[parent.type] !== child.type) return false;
		return !links.some(link => link.parent_id === parentId && link.child_id === childId);
	};
	const canConnect = (sourceId: string, direction: ConnectorDirection, targetId: string) =>
		direction === 'child' ? canLink(sourceId, targetId) : canLink(targetId, sourceId);
	const connect = (sourceId: string, direction: ConnectorDirection, targetId: string) =>
		direction === 'child' ? addLink(sourceId, targetId) : addLink(targetId, sourceId);

	const childOptions = (objective: Objective) => {
		const childType = childObjectiveType[objective.type];
		return childType
			? ordered[childType].filter(child => canLink(objective.id, child.id))
			: undefined;
	};
	const parentOptions = (objective: Objective) => {
		const parentType = parentObjectiveType[objective.type];
		return parentType
			? ordered[parentType].filter(parent => canLink(parent.id, objective.id))
			: undefined;
	};

	// Same interaction as the board: drag from a connector onto a card, or click to pick one
	const startConnection = (
		source: ObjectiveTreeNode,
		direction: ConnectorDirection,
		event: PointerEvent,
		openMenu: () => void,
	) => {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		const start = { x: event.clientX, y: event.clientY };
		const sourceId = source.objective.id;
		let dragging = false;

		const toBoard = (pointerEvent: globalThis.PointerEvent) => {
			const origin = boardRef.current?.getBoundingClientRect();
			return {
				x: pointerEvent.clientX - (origin?.left ?? 0),
				y: pointerEvent.clientY - (origin?.top ?? 0),
			};
		};
		const findTarget = (pointerEvent: globalThis.PointerEvent) => {
			const element = document
				.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)
				?.closest<HTMLElement>('[data-tree-key]');
			const targetId = element?.dataset.treeObjective;
			return targetId && canConnect(sourceId, direction, targetId)
				? { key: element.dataset.treeKey!, id: targetId }
				: null;
		};
		const cleanup = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onCancel);
			setConnection(null);
		};
		const onMove = (pointerEvent: globalThis.PointerEvent) => {
			const distance = Math.hypot(
				pointerEvent.clientX - start.x,
				pointerEvent.clientY - start.y,
			);
			if (!dragging && distance < dragThreshold) return;
			dragging = true;
			setConnection({
				sourceKey: source.key,
				sourceId,
				direction,
				pointer: toBoard(pointerEvent),
				targetKey: findTarget(pointerEvent)?.key ?? null,
			});
		};
		const onUp = (pointerEvent: globalThis.PointerEvent) => {
			cleanup();
			if (!dragging) {
				openMenu();
				return;
			}
			const target = findTarget(pointerEvent);
			if (target) connect(sourceId, direction, target.id);
		};
		const onCancel = () => cleanup();

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onCancel);
	};

	const cardState = (node: ObjectiveTreeNode): ObjectiveCardState => {
		if (!connection) return 'default';
		if (connection.targetKey === node.key) return 'dropHover';
		if (connection.sourceKey === node.key) return 'connectionSource';
		return canConnect(connection.sourceId, connection.direction, node.objective.id)
			? 'dropCandidate'
			: 'default';
	};

	const nodeAnchor = (key: string, edge: 'top' | 'bottom'): [number, number] | null => {
		const node = nodesByKey.get(key);
		const row = node && rowBoxes[node.objective.type];
		if (!node || !row) return null;
		const x = row.x + layout.offsets[node.key] + nodeWidth / 2;
		return [x, edge === 'top' ? row.y : row.y + heightOf(node.objective.id)];
	};

	const connectionPath = (() => {
		if (!connection) return null;
		const toChild = connection.direction === 'child';
		const from = nodeAnchor(connection.sourceKey, toChild ? 'bottom' : 'top');
		if (!from) return null;
		const to =
			(connection.targetKey &&
				nodeAnchor(connection.targetKey, toChild ? 'top' : 'bottom')) ||
			([connection.pointer.x, connection.pointer.y] as [number, number]);
		return { d: buildVerticalBezierPath(from, to, toChild ? 1 : -1), to };
	})();

	return (
		// Height = viewport minus top bar, page padding, page header and the step navigation spacer
		<div className='bg-background-default shadow-tile flex h-[calc(100vh-264px)] min-h-96 w-full flex-col rounded-sm p-4'>
			<div className='flex-1 overflow-auto'>
				<div
					ref={boardRef}
					className='relative flex min-h-full w-max min-w-full flex-col gap-10'
					onMouseOver={event => {
						const node =
							event.target instanceof Element
								? event.target.closest<HTMLElement>('[data-tree-objective]')
								: null;
						setHoveredId(node?.dataset.treeObjective ?? null);
					}}
					onMouseLeave={() => setHoveredId(null)}
				>
					{levelTypes.map(type => (
						<div key={type} className='flex flex-1 items-stretch gap-4'>
							{/* Labels sit in a sticky gutter so the gaps between rows stay free for connectors */}
							<div className='bg-background-default sticky left-0 z-30 flex w-36 shrink-0 items-center gap-3'>
								<p className='text-base leading-6 font-medium'>
									{objectiveTypeLabel[type]}
								</p>
								<span className='bg-background-light flex w-8 justify-center rounded-full text-sm leading-5'>
									{objectives.filter(objective => objective.type === type).length}
								</span>
							</div>
							<div className='flex flex-1 items-center rounded-sm bg-[rgba(209,213,220,0.25)] px-7 py-4'>
								<div
									data-tree-row={type}
									className='relative'
									style={{ width: layout.extent, height: rowHeight(type) }}
								>
									{nodes
										.filter(node => node.objective.type === type)
										.map(node => (
											<TreeNodeCard
												key={node.key}
												node={node}
												left={layout.offsets[node.key] ?? 0}
												highlighted={
													!connection && hoveredId === node.objective.id
												}
												state={cardState(node)}
												dimmed={
													connection !== null &&
													cardState(node) === 'default'
												}
												connecting={connection !== null}
												activeConnector={
													connection?.sourceKey === node.key
														? connection.direction
														: null
												}
												childOptions={childOptions(node.objective)}
												parentOptions={parentOptions(node.objective)}
												onConnectorPointerDown={(
													event,
													direction,
													openMenu,
												) =>
													startConnection(
														node,
														direction,
														event,
														openMenu,
													)
												}
												onLinkChild={childId =>
													addLink(node.objective.id, childId)
												}
												onLinkParent={parentId =>
													addLink(parentId, node.objective.id)
												}
											/>
										))}
								</div>
							</div>
						</div>
					))}
					<svg className='pointer-events-none absolute inset-0 z-10 size-full overflow-visible'>
						<defs>
							<marker
								id='objective-tree-arrow'
								viewBox='0 0 8 8'
								refX='8'
								refY='4'
								markerWidth='8'
								markerHeight='8'
								markerUnits='userSpaceOnUse'
								orient='auto'
							>
								<path d='M0,0 L8,4 L0,8 z' className='fill-primary-resting' />
							</marker>
						</defs>
						{edges.map(edge => (
							<path
								key={edge.key}
								d={edge.path}
								fill='none'
								markerEnd='url(#objective-tree-arrow)'
								className={cn('stroke-primary-resting [stroke-width:1.5]', {
									'stroke-primary-hover [stroke-width:2.5]':
										hoveredId !== null && edge.objectiveIds.includes(hoveredId),
								})}
							/>
						))}
					</svg>
					{connectionPath && (
						<svg className='pointer-events-none absolute inset-0 z-40 size-full overflow-visible'>
							<path
								d={connectionPath.d}
								fill='none'
								strokeWidth={2}
								strokeDasharray='5 5'
								className='stroke-primary-resting'
							/>
							<circle
								cx={connectionPath.to[0]}
								cy={connectionPath.to[1]}
								r={3}
								strokeWidth={1.5}
								className='fill-background-default stroke-primary-resting'
							/>
						</svg>
					)}
				</div>
			</div>
		</div>
	);
};

type TreeNodeCardProps = {
	node: ObjectiveTreeNode;
	left: number;
	highlighted: boolean;
	state: ObjectiveCardState;
	dimmed: boolean;
	connecting: boolean;
	activeConnector: ConnectorDirection | null;
	// Undefined when the objective's level has no children / parents
	childOptions?: Objective[];
	parentOptions?: Objective[];
	onConnectorPointerDown: (
		event: PointerEvent,
		direction: ConnectorDirection,
		openMenu: () => void,
	) => void;
	onLinkChild: (childId: string) => void;
	onLinkParent: (parentId: string) => void;
};

const TreeNodeCard = ({
	node,
	left,
	highlighted,
	state,
	dimmed,
	connecting,
	activeConnector,
	childOptions,
	parentOptions,
	onConnectorPointerDown,
	onLinkChild,
	onLinkParent,
}: TreeNodeCardProps) => {
	const connectorProps = (direction: ConnectorDirection) => ({
		objective: node.objective,
		direction,
		side: direction === 'child' ? ('bottom' as const) : ('top' as const),
		active: activeConnector === direction,
		hidden: connecting && activeConnector !== direction,
		onPointerDown: (event: PointerEvent, openMenu: () => void) =>
			onConnectorPointerDown(event, direction, openMenu),
	});

	return (
		<div
			data-tree-objective={node.objective.id}
			data-tree-key={node.key}
			className={cn('group/node absolute top-0 z-20', { 'opacity-40': dimmed })}
			style={{ left, width: nodeWidth }}
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
					`bg-background-default relative z-10 flex items-center gap-2 rounded-sm border-2
					border-transparent py-1.5 pr-2.5 pl-1.5
					shadow-[0px_2px_2px_rgba(0,0,0,0.14),0px_3px_2px_rgba(0,0,0,0.12)]`,
					{
						'border-diagram-connector bg-accent-canvas':
							highlighted || state === 'dropHover',
						'border-diagram-connector': state === 'connectionSource',
						'border-accent-border bg-accent-canvas border-dashed':
							state === 'dropCandidate',
					},
				)}
			>
				<ObjectiveTypeBadge type={node.objective.type} />
				<p className='min-w-0 flex-1 text-sm leading-5 font-medium break-words'>
					{node.objective.name}
				</p>
			</div>
		</div>
	);
};
