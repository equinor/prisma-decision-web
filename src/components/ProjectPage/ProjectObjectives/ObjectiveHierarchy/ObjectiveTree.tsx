import { Icon } from '@equinor/eds-core-react';
import { link } from '@equinor/eds-icons';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
	filterValidLinks,
	objectiveTypeLabel,
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
import { ObjectiveType } from '../../../../validators';
import { ObjectiveTypeBadge } from './ObjectiveTypeBadge';

const levelTypes: ObjectiveType[] = ['Strategic', 'Fundamental', 'Mean'];
const nodeWidth = 200;
const defaultNodeHeight = 40;

type RowBox = { x: number; y: number };

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const flatten = (nodes: ObjectiveTreeNode[]): ObjectiveTreeNode[] =>
	nodes.flatMap(node => [node, ...flatten(node.children)]);

// Read-only top-down tree: an objective linked to several parents is repeated under each of them
export const ObjectiveTree = () => {
	const { selectedObjectives: objectives } = useSelectedProjectObjectives();
	const { links: storedLinks } = useObjectiveLinks();
	const boardRef = useRef<HTMLDivElement>(null);
	const [heights, setHeights] = useState<Record<string, number>>({});
	const [rowBoxes, setRowBoxes] = useState<Partial<Record<ObjectiveType, RowBox>>>({});
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const objectivesById = useMemo(
		() => new Map(objectives.map(objective => [objective.id, objective])),
		[objectives],
	);
	const links = useMemo(
		() => filterValidLinks(storedLinks, objectivesById),
		[storedLinks, objectivesById],
	);
	const forest = useMemo(
		() => buildObjectiveForest(orderObjectivesByLinks(objectives, links), links),
		[objectives, links],
	);
	const nodes = useMemo(() => flatten(forest), [forest]);
	const nodesByKey = useMemo(() => new Map(nodes.map(node => [node.key, node])), [nodes]);
	const occurrences = useMemo(() => {
		const counts = new Map<string, number>();
		nodes.forEach(node =>
			counts.set(node.objective.id, (counts.get(node.objective.id) ?? 0) + 1),
		);
		return counts;
	}, [nodes]);

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

	// Every occurrence of an objective has the same width and content, so one height per objective
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

	// Org-chart connectors: down from the parent, along a shared line between the rows, down to the child
	const edges = nodes.flatMap(node => {
		const parent = node.parentKey ? nodesByKey.get(node.parentKey) : undefined;
		const parentRow = parent && rowBoxes[parent.objective.type];
		const childRow = rowBoxes[node.objective.type];
		if (!parent || !parentRow || !childRow) return [];
		const startX = parentRow.x + layout.offsets[parent.key] + nodeWidth / 2;
		const startY = parentRow.y + heightOf(parent.objective.id);
		const endX = childRow.x + layout.offsets[node.key] + nodeWidth / 2;
		const endY = childRow.y;
		const busY = (parentRow.y + rowHeight(parent.objective.type) + endY) / 2;
		return [
			{
				key: node.key,
				objectiveIds: [parent.objective.id, node.objective.id],
				path: buildRoundedPolylinePath(
					[
						[startX, startY],
						[startX, busY],
						[endX, busY],
						[endX, endY],
					],
					6,
				),
			},
		];
	});

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
												occurrences={
													occurrences.get(node.objective.id) ?? 1
												}
												highlighted={hoveredId === node.objective.id}
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
				</div>
			</div>
		</div>
	);
};

const TreeNodeCard = ({
	node,
	left,
	occurrences,
	highlighted,
}: {
	node: ObjectiveTreeNode;
	left: number;
	occurrences: number;
	highlighted: boolean;
}) => (
	<div
		data-tree-objective={node.objective.id}
		className={cn(
			`bg-background-default absolute top-0 z-20 flex items-center gap-2 rounded-sm
			border-2 border-transparent py-1.5 pr-2.5 pl-1.5
			shadow-[0px_2px_2px_rgba(0,0,0,0.14),0px_3px_2px_rgba(0,0,0,0.12)]`,
			{ 'border-diagram-connector bg-accent-canvas': highlighted },
		)}
		style={{ left, width: nodeWidth }}
	>
		<ObjectiveTypeBadge type={node.objective.type} />
		<p className='min-w-0 flex-1 text-sm leading-5 font-medium break-words'>
			{node.objective.name}
		</p>
		{occurrences > 1 && (
			<span
				className='text-text-tertiary flex shrink-0 items-center gap-0.5 text-xs font-medium'
				title={`Shown ${occurrences} times – once under each objective it supports`}
			>
				<Icon data={link} size={16} className='fill-text-tertiary' />
				{occurrences}
			</span>
		)}
	</div>
);
