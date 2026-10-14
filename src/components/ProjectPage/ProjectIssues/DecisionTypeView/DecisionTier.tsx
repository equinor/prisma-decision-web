import { useDroppable } from '@dnd-kit/react';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { packDecisionTierRows } from '../../../../utils/packDecisionTierRows';
import { cn } from '../../../../utils/cn';
import { Issue } from '../../../../validators';
import { DECISION_DRAG_TYPE, decisionChipClassName, DraggableDecisionChip } from './DecisionChip';
import { DecisionTierConfig, tierShapeClassName } from './decisionTiers';

const ITEM_HEIGHT = 28;
const ROW_GAP = 16;
const COLUMN_GAP = 8;
const PADDING_X = 24;
const PADDING_Y = 16;
const BORDER_WIDTH = 1;
const CORNER_RADIUS = 4;
// The leader line sits this far below the top of its legend.
const LEGEND_LEADER_OFFSET = 21;
// The leader runs into the legend's (empty) 20px indent.
const LEADER_OVERLAP = 10;

const moreButtonClassName =
	'shadow-raised bg-background-default block h-7 min-w-7 shrink-0 rounded-full px-2 text-base leading-5 font-bold whitespace-nowrap';

type Point = [number, number];

const roundedPolygonPath = (points: Point[], radius: number) => {
	const towards = (from: Point, to: Point): Point => {
		const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
		const cut = Math.min(radius, length / 2) / length;
		return [from[0] + (to[0] - from[0]) * cut, from[1] + (to[1] - from[1]) * cut];
	};
	const corners = points.map((point, index) => {
		const previous = points[(index - 1 + points.length) % points.length];
		const next = points[(index + 1) % points.length];
		return `${index === 0 ? 'M' : 'L'}${towards(point, previous)} Q${point} ${towards(point, next)}`;
	});
	return `${corners.join(' ')} Z`;
};

export const DecisionTier = ({
	tier,
	issues,
	top,
	centerX,
	height,
	topWidth,
	bottomWidth,
	legendX,
	showingAll,
	onShowAll,
}: DecisionTierProps) => {
	const clipId = `decision-tier-${useId().replace(/[^\w-]/g, '')}`;
	const measureRef = useRef<HTMLDivElement>(null);
	const [measured, setMeasured] = useState<{ items: number[]; more: number } | null>(null);
	const { ref: dropRef, isDropTarget } = useDroppable({
		id: tier.type,
		accept: DECISION_DRAG_TYPE,
		data: { type: tier.type },
	});

	useLayoutEffect(() => {
		const element = measureRef.current;
		if (!element) return;
		const measure = () => {
			const widths = Array.from(element.children, child =>
				Math.ceil(child.getBoundingClientRect().width),
			);
			setMeasured({ items: widths.slice(0, -1), more: widths[widths.length - 1] });
		};
		measure();
		// Re-measure once web fonts finish loading and change the chip widths.
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [issues]);

	const packed = useMemo(() => {
		if (!measured || measured.items.length !== issues.length) return null;
		return packDecisionTierRows({
			itemWidths: measured.items,
			moreButtonWidth: measured.more,
			height,
			widthAt: y => topWidth + (bottomWidth - topWidth) * (y / height) - 2 * PADDING_X,
			itemHeight: ITEM_HEIGHT,
			rowGap: ROW_GAP,
			columnGap: COLUMN_GAP,
			paddingY: PADDING_Y,
		});
	}, [measured, issues.length, height, topWidth, bottomWidth]);

	const inset = (bottomWidth - topWidth) / 2;
	const corners: Point[] =
		topWidth < 1
			? [
					[bottomWidth / 2, 0],
					[bottomWidth, height],
					[0, height],
				]
			: [
					[inset, 0],
					[inset + topWidth, 0],
					[bottomWidth, height],
					[0, height],
				];
	const path = roundedPolygonPath(corners, CORNER_RADIUS);

	const leaderY = packed?.rows.length
		? packed.top + (packed.rows.length * (ITEM_HEIGHT + ROW_GAP) - ROW_GAP) / 2
		: height / 2;
	const leaderStart = (bottomWidth + topWidth) / 2 + inset * (leaderY / height);
	const legendLeft = legendX - (centerX - bottomWidth / 2);

	return (
		<section
			ref={dropRef}
			aria-label={`${tier.title} decisions`}
			className='absolute'
			style={{ top, left: centerX - bottomWidth / 2, width: bottomWidth, height }}
		>
			<svg aria-hidden className='absolute inset-0' width={bottomWidth} height={height}>
				<defs>
					<clipPath id={clipId}>
						<path d={path} />
					</clipPath>
				</defs>
				{/* Doubled stroke clipped to the shape = inside-aligned border */}
				<path
					d={path}
					className={cn('stroke-tier-border', tierShapeClassName(tier, isDropTarget))}
					strokeWidth={BORDER_WIDTH * 2}
					clipPath={`url(#${clipId})`}
				/>
			</svg>
			<div
				aria-hidden
				className='absolute h-px bg-[repeating-linear-gradient(to_right,var(--color-tier-leader)_0_4px,transparent_4px_8px)]'
				style={{
					top: leaderY,
					left: leaderStart,
					width: Math.max(0, legendLeft + LEADER_OVERLAP - leaderStart),
				}}
			/>
			<div
				className='absolute flex flex-col gap-1 pl-5 whitespace-nowrap'
				style={{ top: leaderY - LEGEND_LEADER_OFFSET, left: legendLeft }}
			>
				<div className='flex items-center gap-2.5'>
					<p className='text-text-default text-lg leading-6 font-medium tracking-[0.2px]'>
						{tier.title}
					</p>
					<p className='text-text-secondary text-sm leading-4 font-medium'>
						{issues.length}
					</p>
				</div>
				<p className='text-text-secondary text-sm leading-4 font-medium'>{tier.subtitle}</p>
			</div>
			<div aria-hidden className='invisible absolute size-0 overflow-hidden'>
				<div ref={measureRef} className='flex w-max items-start'>
					{issues.map(issue => (
						<span key={issue.id} className={decisionChipClassName}>
							{issue.name}
						</span>
					))}
					<span className={moreButtonClassName}>+{issues.length}</span>
				</div>
			</div>
			{packed?.rows.map((row, rowIndex) => (
				<div
					key={rowIndex}
					className='absolute inset-x-0 flex justify-center gap-2'
					style={{ top: packed.top + rowIndex * (ITEM_HEIGHT + ROW_GAP) }}
				>
					{row.map(index => (
						<DraggableDecisionChip key={issues[index].id} issue={issues[index]} />
					))}
					{rowIndex === packed.rows.length - 1 && packed.hiddenCount > 0 && (
						<button
							type='button'
							onClick={onShowAll}
							aria-expanded={showingAll}
							aria-label={`Show all ${issues.length} ${tier.title.toLowerCase()} decisions`}
							title={`Show all ${issues.length} ${tier.title.toLowerCase()} decisions`}
							className={cn(
								moreButtonClassName,
								'text-primary-resting hover:bg-background-light cursor-pointer',
								showingAll && 'outline-2 outline-current',
							)}
						>
							+{packed.hiddenCount}
						</button>
					)}
				</div>
			))}
		</section>
	);
};

type DecisionTierProps = {
	tier: DecisionTierConfig;
	issues: Issue[];
	top: number;
	centerX: number;
	height: number;
	topWidth: number;
	bottomWidth: number;
	legendX: number;
	showingAll: boolean;
	onShowAll: () => void;
};
