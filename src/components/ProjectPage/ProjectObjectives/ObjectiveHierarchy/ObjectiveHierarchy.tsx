import { Button, Icon, Snackbar } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
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
	ObjectiveLink,
	objectiveTypeLabel,
	parentObjectiveType,
	useObjectiveLinks,
} from '../../../../hooks/useObjectiveLinks';
import { useUpdateObjective } from '../../../../hooks/api/useUpdateObjective';
import { useSelectedProjectObjectives } from '../../../../hooks/useSelectedProjectObjectives';
import { useTweenedValues } from '../../../../hooks/useTweenedValues';
import {
	buildBezierPath,
	buildObjectiveLinkGeometry,
	CardRect,
} from '../../../../utils/buildObjectiveLinkGeometry';
import {
	CardSize,
	defaultCardSize,
	layoutObjectiveHierarchy,
} from '../../../../utils/layoutObjectiveHierarchy';
import { orderObjectivesByLinks } from '../../../../utils/orderObjectivesByLinks';
import { cn } from '../../../../utils/cn';
import { Objective, ObjectiveType } from '../../../../validators';
import { ConnectorDirection, ObjectiveCard, ObjectiveCardState } from './ObjectiveCard';
import { ObjectiveLinkEdges } from './ObjectiveLinkEdges';
import { LinkedObjective, ObjectiveLinksPanel } from './ObjectiveLinksPanel';
import { ComposerLocation, ObjectiveQuickAdd } from './ObjectiveQuickAdd';
import { ObjectiveTypeBadge } from './ObjectiveTypeBadge';

const columnTypes: ObjectiveType[] = ['Strategic', 'Fundamental', 'Mean'];

type Point = { x: number; y: number };
type PendingConnection = {
	sourceId: string;
	direction: ConnectorDirection;
	pointer: Point;
	targetId: string | null;
};
type ColumnBox = { x: number; y: number; width: number };
type PendingMove = {
	objective: Objective;
	pointer: Point;
	// Where the card was grabbed, so the preview doesn't jump under the pointer
	grab: Point;
	targetType: ObjectiveType | null;
};
type Reclassification = {
	objective: Objective;
	type: ObjectiveType;
	removedLinks: ObjectiveLink[];
};

const dragThreshold = 4;

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export const ObjectiveHierarchy = () => {
	const { selectedObjectives: objectives } = useSelectedProjectObjectives();
	const {
		links: storedLinks,
		addLink,
		removeLink,
		setLinksFor,
		restoreLinks,
	} = useObjectiveLinks();
	const { mutate: updateObjective } = useUpdateObjective();
	const boardRef = useRef<HTMLDivElement>(null);
	const [sizes, setSizes] = useState<Record<string, CardSize>>({});
	const [columnBoxes, setColumnBoxes] = useState<Partial<Record<ObjectiveType, ColumnBox>>>({});
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
	const [connection, setConnection] = useState<PendingConnection | null>(null);
	const [move, setMove] = useState<PendingMove | null>(null);
	const [lastReclassification, setLastReclassification] = useState<Reclassification | null>(null);
	const justDragged = useRef(false);
	const [composer, setComposer] = useState<ComposerLocation | null>(null);
	const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
	const highlightTimers = useRef(new Set<ReturnType<typeof setTimeout>>());

	useEffect(() => {
		const timers = highlightTimers.current;
		return () => timers.forEach(clearTimeout);
	}, []);

	const onObjectiveCreated = (id: string) => {
		setComposer(null);
		setHighlightedIds(current => [...current, id]);
		const timer = setTimeout(() => {
			setHighlightedIds(current => current.filter(highlightedId => highlightedId !== id));
			highlightTimers.current.delete(timer);
		}, 2000);
		highlightTimers.current.add(timer);
	};

	const objectivesById = useMemo(
		() => new Map(objectives.map(objective => [objective.id, objective])),
		[objectives],
	);

	const links = useMemo(
		() => filterValidLinks(storedLinks, objectivesById),
		[storedLinks, objectivesById],
	);

	const orderedColumns = useMemo(
		() => orderObjectivesByLinks(objectives, links),
		[objectives, links],
	);
	const columnIndex = useMemo(
		() =>
			new Map(
				columnTypes.flatMap(type =>
					orderedColumns[type].map((objective, index) => [objective.id, index] as const),
				),
			),
		[orderedColumns],
	);

	const canLink = (parentId: string, childId: string) => {
		const parent = objectivesById.get(parentId);
		const child = objectivesById.get(childId);
		if (!parent || !child || childObjectiveType[parent.type] !== child.type) return false;
		return !links.some(link => link.parent_id === parentId && link.child_id === childId);
	};

	const measure = useCallback(() => {
		const board = boardRef.current;
		if (!board) return;
		const origin = board.getBoundingClientRect();

		const nextSizes: Record<string, CardSize> = {};
		board.querySelectorAll<HTMLElement>('[data-objective-id]').forEach(card => {
			const cardTop = card.getBoundingClientRect().top;
			const anchor = card.querySelector('[data-objective-anchor]')?.getBoundingClientRect();
			nextSizes[card.dataset.objectiveId!] = {
				height: Math.round(card.offsetHeight),
				anchorOffset: Math.round(
					anchor ? anchor.top - cardTop + anchor.height / 2 : card.offsetHeight / 2,
				),
				anchorHeight: Math.round(anchor?.height ?? card.offsetHeight),
			};
		});
		setSizes(current => (sameJson(current, nextSizes) ? current : nextSizes));

		const nextBoxes: Partial<Record<ObjectiveType, ColumnBox>> = {};
		board.querySelectorAll<HTMLElement>('[data-objective-cards]').forEach(area => {
			const rect = area.getBoundingClientRect();
			nextBoxes[area.dataset.objectiveCards as ObjectiveType] = {
				x: Math.round(rect.left - origin.left),
				y: Math.round(rect.top - origin.top),
				width: Math.round(rect.width),
			};
		});
		setColumnBoxes(current => (sameJson(current, nextBoxes) ? current : nextBoxes));
	}, []);

	useLayoutEffect(measure, [measure, objectives, expandedId]);

	useEffect(() => {
		const board = boardRef.current;
		if (!board) return;
		const observer = new ResizeObserver(measure);
		observer.observe(board);
		board.querySelectorAll('[data-objective-id]').forEach(card => observer.observe(card));
		return () => observer.disconnect();
	}, [measure, objectives]);

	// Lay out with the expanded card collapsed, then only push the cards below it in its column,
	// so opening a card doesn't rearrange the whole board
	const expandedSize = expandedId ? sizes[expandedId] : undefined;
	const collapsedHeight = expandedSize ? expandedSize.anchorHeight + 4 : 0;
	const layoutSizes = useMemo(
		() =>
			expandedId && expandedSize
				? { ...sizes, [expandedId]: { ...expandedSize, height: collapsedHeight } }
				: sizes,
		[sizes, expandedId, expandedSize, collapsedHeight],
	);
	const baseLayout = useMemo(
		() =>
			layoutObjectiveHierarchy(
				columnTypes.map(type => orderedColumns[type]),
				links,
				layoutSizes,
			),
		[orderedColumns, links, layoutSizes],
	);
	const layout = useMemo(() => {
		const expanded = expandedId ? objectivesById.get(expandedId) : undefined;
		if (!expanded || !expandedSize) return baseLayout;
		const extra = expandedSize.height - collapsedHeight;
		const expandedTop = baseLayout.tops[expanded.id];
		const column = orderedColumns[expanded.type];
		const tops = { ...baseLayout.tops };
		column.forEach(objective => {
			if (objective.id !== expanded.id && tops[objective.id] > expandedTop)
				tops[objective.id] += extra;
		});
		const height = Math.max(
			baseLayout.height,
			...column.map(
				objective => tops[objective.id] + (sizes[objective.id] ?? defaultCardSize).height,
			),
		);
		return { tops, height };
	}, [
		baseLayout,
		expandedId,
		expandedSize,
		collapsedHeight,
		objectivesById,
		orderedColumns,
		sizes,
	]);
	const tops = useTweenedValues(layout.tops);
	const topOf = (id: string) => tops[id] ?? layout.tops[id] ?? 0;

	const rects: Record<string, CardRect> = {};
	columnTypes.forEach(type => {
		const box = columnBoxes[type];
		if (!box) return;
		orderedColumns[type].forEach(objective => {
			const size = sizes[objective.id] ?? defaultCardSize;
			const y = box.y + topOf(objective.id);
			rects[objective.id] = {
				x: box.x,
				y,
				width: box.width,
				height: size.height,
				anchorY: y + size.anchorOffset,
				anchorHeight: size.anchorHeight,
			};
		});
	});

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			)
				return;
			if (event.key === 'Escape') {
				setExpandedId(null);
				setSelectedLinkId(null);
			}
			if ((event.key === 'Delete' || event.key === 'Backspace') && selectedLinkId) {
				removeLink(selectedLinkId);
				setSelectedLinkId(null);
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [selectedLinkId, removeLink]);

	const geometry = buildObjectiveLinkGeometry(links, rects);

	const byColumnOrder = (a: LinkedObjective, b: LinkedObjective) =>
		(columnIndex.get(a.objective.id) ?? 0) - (columnIndex.get(b.objective.id) ?? 0);

	const linkedParents = (objectiveId: string) =>
		links
			.filter(link => link.child_id === objectiveId)
			.map(link => ({ linkId: link.id, objective: objectivesById.get(link.parent_id)! }))
			.toSorted(byColumnOrder);

	const linkedChildren = (objectiveId: string) =>
		links
			.filter(link => link.parent_id === objectiveId)
			.map(link => ({ linkId: link.id, objective: objectivesById.get(link.child_id)! }))
			.toSorted(byColumnOrder);

	const parentCount = (objectiveId: string) =>
		links.filter(link => link.child_id === objectiveId).length;

	const linkTargets = (sourceId: string) => {
		const childType = childObjectiveType[objectivesById.get(sourceId)?.type ?? 'Mean'];
		return childType
			? orderedColumns[childType].filter(objective => canLink(sourceId, objective.id))
			: [];
	};

	const parentOptions = (childId: string) => {
		const parentType = parentObjectiveType[objectivesById.get(childId)?.type ?? 'Strategic'];
		return parentType
			? orderedColumns[parentType].filter(objective => canLink(objective.id, childId))
			: [];
	};

	// Same interaction as the influence diagram shape view: drag from a connector onto a card
	// to link, or click it to pick from a menu. The right connector links to a supporting
	// objective, the left one to an objective it contributes to.
	const canConnect = (sourceId: string, direction: ConnectorDirection, targetId: string) =>
		direction === 'child' ? canLink(sourceId, targetId) : canLink(targetId, sourceId);

	const connect = (sourceId: string, direction: ConnectorDirection, targetId: string) =>
		direction === 'child' ? addLink(sourceId, targetId) : addLink(targetId, sourceId);

	const startConnection = (
		sourceId: string,
		direction: ConnectorDirection,
		event: PointerEvent,
		openMenu: () => void,
	) => {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		const start = { x: event.clientX, y: event.clientY };
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
				?.closest<HTMLElement>('[data-objective-id]');
			const targetId = element?.dataset.objectiveId;
			return targetId && canConnect(sourceId, direction, targetId) ? targetId : null;
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
				sourceId,
				direction,
				pointer: toBoard(pointerEvent),
				targetId: findTarget(pointerEvent),
			});
		};
		const onUp = (pointerEvent: globalThis.PointerEvent) => {
			cleanup();
			if (!dragging) {
				openMenu();
				return;
			}
			const targetId = findTarget(pointerEvent);
			if (targetId) connect(sourceId, direction, targetId);
		};
		const onCancel = () => cleanup();

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onCancel);
	};

	// A new level makes all of the objective's links invalid, so they are removed (undoable)
	const reclassify = (objective: Objective, type: ObjectiveType) => {
		const removedLinks = storedLinks.filter(
			link => link.parent_id === objective.id || link.child_id === objective.id,
		);
		updateObjective({ ...objective, type });
		setExpandedId(null);
		if (removedLinks.length === 0) return;
		setLinksFor(objective.id, [], []);
		setLastReclassification({ objective, type, removedLinks });
	};

	const undoReclassification = () => {
		if (!lastReclassification) return;
		updateObjective(lastReclassification.objective);
		restoreLinks(lastReclassification.removedLinks);
		setLastReclassification(null);
	};

	// Nearest column to the pointer, so drops in the gaps between columns still count
	const columnAt = (x: number) => {
		let nearest: ObjectiveType | null = null;
		let nearestDistance = Infinity;
		columnTypes.forEach(type => {
			const box = columnBoxes[type];
			if (!box) return;
			const distance = Math.max(box.x - x, 0, x - (box.x + box.width));
			if (distance < nearestDistance) {
				nearest = type;
				nearestDistance = distance;
			}
		});
		return nearest;
	};

	const startMove = (objective: Objective, event: PointerEvent) => {
		if (event.button !== 0) return;
		event.preventDefault();
		const start = { x: event.clientX, y: event.clientY };
		const card = (event.currentTarget as HTMLElement)
			.closest('[data-objective-id]')!
			.getBoundingClientRect();
		const grab = { x: event.clientX - card.left, y: event.clientY - card.top };
		let dragging = false;

		const toBoard = (pointerEvent: globalThis.PointerEvent) => {
			const origin = boardRef.current?.getBoundingClientRect();
			return {
				x: pointerEvent.clientX - (origin?.left ?? 0),
				y: pointerEvent.clientY - (origin?.top ?? 0),
			};
		};
		const cleanup = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onCancel);
			setMove(null);
		};
		const onMove = (pointerEvent: globalThis.PointerEvent) => {
			const distance = Math.hypot(
				pointerEvent.clientX - start.x,
				pointerEvent.clientY - start.y,
			);
			if (!dragging && distance < dragThreshold) return;
			dragging = true;
			const pointer = toBoard(pointerEvent);
			setMove({ objective, pointer, grab, targetType: columnAt(pointer.x) });
		};
		const onUp = (pointerEvent: globalThis.PointerEvent) => {
			cleanup();
			if (!dragging) return;
			// The click that follows the drop must not toggle the card
			justDragged.current = true;
			setTimeout(() => (justDragged.current = false));
			const targetType = columnAt(toBoard(pointerEvent).x);
			if (targetType && targetType !== objective.type) reclassify(objective, targetType);
		};
		const onCancel = () => cleanup();

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onCancel);
	};

	const cardState = (objective: Objective): ObjectiveCardState => {
		if (connection) {
			if (connection.targetId === objective.id) return 'dropHover';
			if (canConnect(connection.sourceId, connection.direction, objective.id))
				return 'dropCandidate';
			return connection.sourceId === objective.id ? 'connectionSource' : 'default';
		}
		return 'default';
	};

	const isDimmed = (objective: Objective) =>
		connection !== null &&
		connection.sourceId !== objective.id &&
		!canConnect(connection.sourceId, connection.direction, objective.id);

	const connectionPath = (() => {
		if (!connection) return null;
		const source = rects[connection.sourceId];
		if (!source) return null;
		const target = connection.targetId ? rects[connection.targetId] : null;
		const toChild = connection.direction === 'child';
		const from: [number, number] = [source.x + (toChild ? source.width : 0), source.anchorY];
		const to: [number, number] = target
			? [target.x + (toChild ? 0 : target.width), target.anchorY]
			: [connection.pointer.x, connection.pointer.y];
		return { d: buildBezierPath(from, to, toChild ? 1 : -1), to };
	})();

	const selectedLinkHandle = geometry.find(item => item.link.id === selectedLinkId)?.handle;

	return (
		<div
			className='bg-background-default shadow-tile flex min-h-[calc(100vh-180px)] w-full
				rounded-sm p-4'
			onClick={() => {
				setExpandedId(null);
				setSelectedLinkId(null);
			}}
		>
			<div
				ref={boardRef}
				className='relative grid w-full grid-cols-3 gap-10'
				onMouseOver={event => {
					const card =
						event.target instanceof Element
							? event.target.closest<HTMLElement>('[data-objective-id]')
							: null;
					setHoveredId(card?.dataset.objectiveId ?? null);
				}}
				onMouseLeave={() => setHoveredId(null)}
			>
				{columnTypes.map(type => {
					const label = objectiveTypeLabel[type];
					const columnObjectives = orderedColumns[type];
					const hasChildren = childObjectiveType[type] !== undefined;
					const hasParents = parentObjectiveType[type] !== undefined;
					const quickAddProps = {
						type,
						label,
						composer,
						onOpen: setComposer,
						onClose: () => setComposer(null),
						onCreated: onObjectiveCreated,
					};
					return (
						<div key={type} className='flex min-w-0 flex-col gap-2'>
							<div className='flex items-center gap-4'>
								<p className='text-base leading-6 font-medium'>{label}</p>
								<span className='bg-background-light flex w-8 justify-center rounded-full text-sm leading-5'>
									{columnObjectives.length}
								</span>
							</div>
							<div
								className={cn(
									`flex flex-1 flex-col items-start gap-4 rounded-sm
									bg-[rgba(209,213,220,0.25)] px-7 py-4 outline-2 outline-transparent`,
									{
										'bg-accent-canvas outline-accent-border outline-dashed':
											move?.targetType === type &&
											move.objective.type !== type,
									},
								)}
							>
								{/* Always rendered so the card areas start at the same height in every column */}
								<ObjectiveQuickAdd {...quickAddProps} position='top' />
								<div
									data-objective-cards={type}
									className='relative w-full'
									style={{ height: layout.height }}
								>
									{columnObjectives.map(objective => (
										<div
											key={objective.id}
											className='absolute inset-x-0'
											style={{ top: topOf(objective.id) }}
										>
											<ObjectiveCard
												key={objective.id}
												objective={objective}
												state={cardState(objective)}
												dimmed={isDimmed(objective)}
												highlighted={highlightedIds.includes(objective.id)}
												expanded={expandedId === objective.id}
												parentCount={parentCount(objective.id)}
												connecting={connection !== null}
												isDragSource={move?.objective.id === objective.id}
												activeConnector={
													connection?.sourceId === objective.id
														? connection.direction
														: null
												}
												childOptions={
													hasChildren
														? linkTargets(objective.id)
														: undefined
												}
												parentOptions={
													hasParents
														? parentOptions(objective.id)
														: undefined
												}
												panel={
													<ObjectiveLinksPanel
														objective={objective}
														contributesTo={linkedParents(objective.id)}
														supportedBy={linkedChildren(objective.id)}
														parentOptions={parentOptions(objective.id)}
														childOptions={linkTargets(objective.id)}
														onLinkParent={parentId =>
															addLink(parentId, objective.id)
														}
														onLinkChild={childId =>
															addLink(objective.id, childId)
														}
														onUnlink={removeLink}
													/>
												}
												onToggleExpanded={() => {
													if (justDragged.current) return;
													setSelectedLinkId(null);
													setExpandedId(current =>
														current === objective.id
															? null
															: objective.id,
													);
												}}
												onDragHandlePointerDown={event =>
													startMove(objective, event)
												}
												onConnectorPointerDown={(
													event,
													direction,
													openMenu,
												) =>
													startConnection(
														objective.id,
														direction,
														event,
														openMenu,
													)
												}
												onLinkChild={childId =>
													addLink(objective.id, childId)
												}
												onLinkParent={parentId =>
													addLink(parentId, objective.id)
												}
											/>
										</div>
									))}
								</div>
								{columnObjectives.length > 0 && (
									<ObjectiveQuickAdd {...quickAddProps} position='bottom' />
								)}
							</div>
						</div>
					);
				})}
				<ObjectiveLinkEdges
					geometry={geometry}
					selectedLinkId={selectedLinkId}
					emphasizedObjectiveId={connection ? null : (hoveredId ?? expandedId)}
					onSelectLink={linkId => {
						setExpandedId(null);
						setSelectedLinkId(linkId);
					}}
				/>
				{connectionPath && (
					<svg className='pointer-events-none absolute inset-0 z-30 size-full overflow-visible'>
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
				{selectedLinkHandle && selectedLinkId && (
					<button
						type='button'
						aria-label='Remove link'
						title='Remove link (Delete)'
						className='bg-background-default border-diagram-connector hover:bg-diagram-connector-hover absolute z-30 flex
							size-6 -translate-1/2 cursor-pointer items-center justify-center rounded-full
							border'
						style={{ left: selectedLinkHandle[0], top: selectedLinkHandle[1] }}
						onClick={event => {
							event.stopPropagation();
							removeLink(selectedLinkId);
							setSelectedLinkId(null);
						}}
					>
						<Icon data={close} size={16} className='fill-diagram-connector' />
					</button>
				)}
				{move && (
					<div
						className='bg-background-default border-diagram-connector shadow-raised
							pointer-events-none absolute z-50 flex rotate-1 items-center gap-2 rounded-sm
							border-2 py-1.5 pr-2.5 pl-1.5'
						style={{
							left: move.pointer.x - move.grab.x,
							top: move.pointer.y - move.grab.y,
							width: columnBoxes[move.objective.type]?.width,
						}}
					>
						<ObjectiveTypeBadge type={move.targetType ?? move.objective.type} />
						<p className='min-w-0 flex-1 text-sm leading-5 font-medium break-words'>
							{move.objective.name}
						</p>
					</div>
				)}
			</div>
			<Snackbar
				open={lastReclassification !== null}
				autoHideDuration={8000}
				onClose={() => setLastReclassification(null)}
				placement='bottom'
			>
				{lastReclassification &&
					`"${lastReclassification.objective.name}" is now ${objectiveTypeLabel[
						lastReclassification.type
					].toLowerCase()}. ${lastReclassification.removedLinks.length} ${
						lastReclassification.removedLinks.length === 1 ? 'link was' : 'links were'
					} removed.`}
				<Snackbar.Action>
					<Button
						variant='ghost'
						onClick={event => {
							event.stopPropagation();
							undoReclassification();
						}}
					>
						Undo
					</Button>
				</Snackbar.Action>
			</Snackbar>
		</div>
	);
};
