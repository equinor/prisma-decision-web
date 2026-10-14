import {
	DragDropEventHandlers,
	DragDropProvider,
	DragOverlay,
	PointerSensor,
} from '@dnd-kit/react';
import { useMeasure } from '@uidotdev/usehooks';
import { useMemo, useState } from 'react';
import { useUpdateIssuesOptimistic } from '../../../../hooks/api/useUpdateIssues';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { cn } from '../../../../utils/cn';
import { DecisionType, Issue } from '../../../../validators';
import { decisionChipClassName } from './DecisionChip';
import { DecisionTier } from './DecisionTier';
import { DecisionTierSheet } from './DecisionTierSheet';
import { decisionTiers } from './decisionTiers';

const ASPECT_RATIO = 1000 / 720;
const TIER_GAP = 12;
const LEGEND_WIDTH = 200;
const MIN_PYRAMID_WIDTH = 360;
// The header sits 8px outside the card's content box (24px vs 32px card padding).
const HEADER_OFFSET = 8;
const HEADER_CLEARANCE = 16;

export const DecisionTypeView = () => {
	const issues = useSelectedProjectIssues();
	const [ref, { width, height }] = useMeasure<HTMLDivElement>();
	const [headerRef, headerSize] = useMeasure<HTMLDivElement>();
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();
	const [sheetType, setSheetType] = useState<DecisionType | null>(null);
	const sheetTier = decisionTiers.find(tier => tier.type === sheetType);

	const decisionsByType = useMemo(() => {
		const decisions = issues
			.filter(issue => issue.type === 'Decision')
			.sort((a, b) => a.order - b.order);
		return new Map(
			decisionTiers.map(tier => [
				tier.type,
				decisions.filter(issue => issue.decision.type === tier.type),
			]),
		);
	}, [issues]);

	const onDragEnd: DragDropEventHandlers['onDragEnd'] = event => {
		const { source, target } = event.operation;
		if (event.canceled || !source || !target) return;
		const issue: Issue = source.data.issue;
		const type: DecisionType = target.data.type;
		if (issue.decision.type === type) return;
		updateIssues([{ ...issue, decision: { ...issue.decision, type } }]);
	};

	return (
		// Pointer only: the keyboard sensor would take over Enter, which opens the edit dialog
		<DragDropProvider sensors={[PointerSensor]} onDragEnd={onDragEnd}>
			{/* Ends 24px above the viewport; -mb-4 offsets the layout's 40px bottom padding to avoid a scrollbar */}
			<div className='-mb-4 flex h-[calc(100vh-180px)] min-h-105 w-full gap-4'>
				<div className='bg-background-default border-background-medium relative min-w-0 flex-1 rounded-sm border p-8'>
					<div ref={ref} className='size-full overflow-auto'>
						{width !== null && height !== null && (
							<DecisionPyramid
								availableWidth={width}
								availableHeight={height}
								headerWidth={(headerSize.width ?? 0) - HEADER_OFFSET}
								headerHeight={(headerSize.height ?? 0) - HEADER_OFFSET}
								decisionsByType={decisionsByType}
								sheetType={sheetType}
								onShowAll={type =>
									setSheetType(current => (current === type ? null : type))
								}
							/>
						)}
					</div>
					<div
						ref={headerRef}
						className='pointer-events-none absolute top-6 left-6 flex max-w-[calc(100%-3rem)] flex-col gap-1'
					>
						<h2 className='text-text-default text-2xl leading-7.5'>
							Decision hierarchy
						</h2>
						<p className='text-text-default text-sm leading-4 font-medium'>
							Organise decisions by what is given, in focus, or left for later.
						</p>
					</div>
				</div>
				{sheetTier && (
					<DecisionTierSheet
						key={sheetTier.type}
						tier={sheetTier}
						issues={decisionsByType.get(sheetTier.type) ?? []}
						onClose={() => setSheetType(null)}
					/>
				)}
			</div>
			<DragOverlay>
				{source => (
					<span className={cn(decisionChipClassName, 'cursor-grabbing')}>
						{source.data.issue.name}
					</span>
				)}
			</DragOverlay>
		</DragDropProvider>
	);
};

const DecisionPyramid = ({
	availableWidth,
	availableHeight,
	headerWidth,
	headerHeight,
	decisionsByType,
	sheetType,
	onShowAll,
}: DecisionPyramidProps) => {
	const fitWidth = (height: number) =>
		Math.max(MIN_PYRAMID_WIDTH, Math.min(availableWidth - LEGEND_WIDTH, height * ASPECT_RATIO));
	const leftOffset = (width: number) => Math.max(0, (availableWidth - width - LEGEND_WIDTH) / 2);
	const overlapsHeader = (width: number) => {
		const apexX = leftOffset(width) + width / 2;
		const halfWidthBelowHeader = (width / 2) * (headerHeight / (width / ASPECT_RATIO));
		return apexX - halfWidthBelowHeader < headerWidth + HEADER_CLEARANCE;
	};

	let topOffset = 0;
	let pyramidWidth = fitWidth(availableHeight);
	if (headerWidth > 0 && overlapsHeader(pyramidWidth)) {
		topOffset = headerHeight + HEADER_CLEARANCE;
		pyramidWidth = fitWidth(availableHeight - topOffset);
	}
	const pyramidHeight = pyramidWidth / ASPECT_RATIO;
	const centerX = pyramidWidth / 2;
	const tierHeight = (pyramidHeight - 2 * TIER_GAP) / 3;
	const halfWidthAt = (y: number) => centerX * (y / pyramidHeight);

	return (
		<div
			className='relative'
			style={{
				marginTop: topOffset,
				marginLeft: leftOffset(pyramidWidth),
				width: pyramidWidth + LEGEND_WIDTH,
				height: pyramidHeight,
			}}
		>
			{decisionTiers.map((tier, index) => {
				const top = index * (tierHeight + TIER_GAP);
				return (
					<DecisionTier
						key={tier.type}
						tier={tier}
						issues={decisionsByType.get(tier.type) ?? []}
						top={top}
						centerX={centerX}
						height={tierHeight}
						topWidth={2 * halfWidthAt(top)}
						bottomWidth={2 * halfWidthAt(top + tierHeight)}
						legendX={pyramidWidth}
						showingAll={sheetType === tier.type}
						onShowAll={() => onShowAll(tier.type)}
					/>
				);
			})}
		</div>
	);
};

type DecisionPyramidProps = {
	availableWidth: number;
	availableHeight: number;
	headerWidth: number;
	headerHeight: number;
	decisionsByType: Map<DecisionType, Issue[]>;
	sheetType: DecisionType | null;
	onShowAll: (type: DecisionType) => void;
};
