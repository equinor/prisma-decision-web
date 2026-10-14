import {
	DragDropEventHandlers,
	DragDropProvider,
	DragOverlay,
	PointerSensor,
} from '@dnd-kit/react';
import { useMeasure } from '@uidotdev/usehooks';
import { Fragment, useMemo, useState } from 'react';
import { useUpdateIssuesOptimistic } from '../../../../hooks/api/useUpdateIssues';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { cn } from '../../../../utils/cn';
import { DecisionType, Issue } from '../../../../validators';
import { decisionChipClassName } from './DecisionChip';
import { DecisionTier, DecisionTierConfig } from './DecisionTier';
import { DecisionTierSheet } from './DecisionTierSheet';

const decisionTiers: DecisionTierConfig[] = [
	{
		type: 'Policy',
		title: 'Policy',
		subtitle: 'Taken as given',
		shapeClassName: 'fill-tier-policy-fill stroke-tier-policy-border',
		dropTargetClassName: 'fill-tier-policy-hover',
		surfaceClassName: 'bg-tier-policy-fill',
		surfaceDropTargetClassName: 'bg-tier-policy-hover',
		accentClassName: 'text-tier-policy-border',
		titleClassName: 'text-text-secondary',
		subtitleClassName: 'text-text-secondary',
	},
	{
		type: 'Focus',
		title: 'Strategic',
		subtitle: 'Focus on in this analysis',
		shapeClassName: 'fill-tier-focus-fill stroke-tier-focus-border',
		dropTargetClassName: 'fill-tier-focus-hover',
		surfaceClassName: 'bg-tier-focus-fill',
		surfaceDropTargetClassName: 'bg-tier-focus-hover',
		accentClassName: 'text-tier-focus-border',
		titleClassName: 'text-tier-focus-text-subtle',
		subtitleClassName: 'text-tier-focus-text-strong',
	},
	{
		type: 'Tactical',
		title: 'Tactical',
		subtitle: 'Decide later',
		shapeClassName: 'fill-tier-tactical-fill stroke-tier-tactical-border',
		dropTargetClassName: 'fill-tier-tactical-hover',
		surfaceClassName: 'bg-tier-tactical-fill',
		surfaceDropTargetClassName: 'bg-tier-tactical-hover',
		accentClassName: 'text-tier-tactical-border',
		titleClassName: 'text-text-secondary',
		subtitleClassName: 'text-text-secondary',
	},
];

const ASPECT_RATIO = 1110 / 784;
const TIER_GAP = 6;
const LABEL_GAP = 48;
const MIN_PYRAMID_WIDTH = 360;
const COMPACT_BREAKPOINT = 900;
// The bottom label is anchored at the tactical tier's midpoint, 5/6 down the pyramid.
const LABEL_ANCHOR_RATIO = 0.5 + 0.5 * (5 / 6);

export const DecisionTypeView = () => {
	const issues = useSelectedProjectIssues();
	const [ref, { width, height }] = useMeasure<HTMLDivElement>();
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
			<div className='flex h-[calc(100vh-260px)] min-h-105 w-full gap-4'>
				<div ref={ref} className='min-w-0 flex-1 overflow-auto'>
					{width !== null && height !== null && (
						<DecisionPyramid
							availableWidth={width}
							availableHeight={height}
							decisionsByType={decisionsByType}
							sheetType={sheetType}
							onShowAll={type =>
								setSheetType(current => (current === type ? null : type))
							}
						/>
					)}
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
	decisionsByType,
	sheetType,
	onShowAll,
}: DecisionPyramidProps) => {
	const compact = availableWidth < COMPACT_BREAKPOINT;
	const labelWidth = compact ? 180 : 240;
	const pyramidWidth = Math.max(
		MIN_PYRAMID_WIDTH,
		Math.min(
			(availableWidth - LABEL_GAP - labelWidth) / LABEL_ANCHOR_RATIO,
			availableHeight * ASPECT_RATIO,
		),
	);
	const pyramidHeight = pyramidWidth / ASPECT_RATIO;
	const centerX = pyramidWidth / 2;
	const tierHeight = (pyramidHeight - 2 * TIER_GAP) / 3;
	const halfWidthAt = (y: number) => centerX * (y / pyramidHeight);

	return (
		<div
			className='relative mx-auto'
			style={{
				width: pyramidWidth * LABEL_ANCHOR_RATIO + LABEL_GAP + labelWidth,
				height: pyramidHeight,
			}}
		>
			{decisionTiers.map((tier, index) => {
				const top = index * (tierHeight + TIER_GAP);
				const middle = top + tierHeight / 2;
				return (
					<Fragment key={tier.type}>
						<DecisionTier
							tier={tier}
							issues={decisionsByType.get(tier.type) ?? []}
							top={top}
							centerX={centerX}
							height={tierHeight}
							topWidth={2 * halfWidthAt(top)}
							bottomWidth={2 * halfWidthAt(top + tierHeight)}
							showingAll={sheetType === tier.type}
							onShowAll={() => onShowAll(tier.type)}
						/>
						<div
							className='absolute flex -translate-y-1/2 flex-col gap-0.5 whitespace-nowrap'
							style={{ top: middle, left: centerX + halfWidthAt(middle) + LABEL_GAP }}
						>
							<p
								className={cn(
									compact ? 'text-2xl leading-8' : 'text-[32px] leading-10',
									tier.titleClassName,
								)}
							>
								{tier.title}
							</p>
							<p
								className={cn(
									'font-medium tracking-[0.2px]',
									compact ? 'text-sm leading-5' : 'text-lg leading-6',
									tier.subtitleClassName,
								)}
							>
								{tier.subtitle}
							</p>
						</div>
					</Fragment>
				);
			})}
		</div>
	);
};

type DecisionPyramidProps = {
	availableWidth: number;
	availableHeight: number;
	decisionsByType: Map<DecisionType, Issue[]>;
	sheetType: DecisionType | null;
	onShowAll: (type: DecisionType) => void;
};
