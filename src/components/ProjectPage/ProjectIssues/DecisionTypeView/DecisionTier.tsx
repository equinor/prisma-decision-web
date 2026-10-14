import { useDroppable } from '@dnd-kit/react';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { packDecisionTierRows } from '../../../../utils/packDecisionTierRows';
import { cn } from '../../../../utils/cn';
import { DecisionType, Issue } from '../../../../validators';
import { DECISION_DRAG_TYPE, decisionChipClassName, DraggableDecisionChip } from './DecisionChip';

export type DecisionTierConfig = {
	type: DecisionType;
	title: string;
	subtitle: string;
	shapeClassName: string;
	dropTargetClassName: string;
	surfaceClassName: string;
	surfaceDropTargetClassName: string;
	accentClassName: string;
	titleClassName: string;
	subtitleClassName: string;
};

const ITEM_HEIGHT = 36;
const ROW_GAP = 16;
const COLUMN_GAP = 12;
const PADDING_X = 16;
const PADDING_Y = 16;
const BORDER_WIDTH = 2;

const moreButtonClassName =
	'shadow-raised bg-background-default block h-9 min-w-9 shrink-0 rounded-full px-3 text-base leading-5 font-bold whitespace-nowrap';

export const DecisionTier = ({
	tier,
	issues,
	top,
	centerX,
	height,
	topWidth,
	bottomWidth,
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
	const points = [
		[inset, 0],
		[inset + topWidth, 0],
		[bottomWidth, height],
		[0, height],
	]
		.map(point => point.join(','))
		.join(' ');

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
						<polygon points={points} />
					</clipPath>
				</defs>
				{/* Doubled stroke clipped to the shape = inside-aligned border */}
				<polygon
					points={points}
					className={cn(tier.shapeClassName, isDropTarget && tier.dropTargetClassName)}
					strokeWidth={BORDER_WIDTH * 2}
					clipPath={`url(#${clipId})`}
				/>
			</svg>
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
					className='absolute inset-x-0 flex justify-center gap-3'
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
								'hover:bg-background-light cursor-pointer',
								tier.accentClassName,
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
	showingAll: boolean;
	onShowAll: () => void;
};
