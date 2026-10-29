import { PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { useMeasure } from '@uidotdev/usehooks';
import type { StakeholderMatrixEntry } from '../../../validators';
import { StakeholderCard } from './StakeholderCard';
import {
	clampAxisValue,
	getRegionKey,
	STAKEHOLDER_CARD_HEIGHT,
	STAKEHOLDER_CARD_MAX_WIDTH,
	stakeholderRegions,
} from './stakeholderRegions';

type StakeholderGridProps = {
	stakeholders: StakeholderMatrixEntry[];
	onStakeholderMove: (
		id: string,
		values: Pick<StakeholderMatrixEntry, 'affecting_the_decision' | 'affected_by_the_decision'>,
	) => void;
};

type DragState = { id: string; offsetX: number; offsetY: number };

const quadrantOrder = ['consult', 'partnerClosely', 'observe', 'keepInformed'] as const;

export const StakeholderGrid = ({ stakeholders, onStakeholderMove }: StakeholderGridProps) => {
	const [plotRef, { width, height }] = useMeasure<HTMLDivElement>();
	const plotElement = useRef<HTMLDivElement | null>(null);
	const [drag, setDrag] = useState<DragState | null>(null);
	const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	// Using the max card width keeps equal values aligned and every card inside the grid.
	const rangeX = Math.max(0, (width ?? 0) - STAKEHOLDER_CARD_MAX_WIDTH);
	const rangeY = Math.max(0, (height ?? 0) - STAKEHOLDER_CARD_HEIGHT);

	const toPosition = (stakeholder: StakeholderMatrixEntry) => ({
		x: clampAxisValue(stakeholder.affecting_the_decision) * rangeX,
		y: (1 - clampAxisValue(stakeholder.affected_by_the_decision)) * rangeY,
	});

	const toValues = (position: { x: number; y: number }) => ({
		affecting_the_decision: rangeX ? clampAxisValue(position.x / rangeX) : 0,
		affected_by_the_decision: rangeY ? clampAxisValue(1 - position.y / rangeY) : 0,
	});

	const clampToPlot = (position: { x: number; y: number }) => ({
		x: Math.min(rangeX, Math.max(0, position.x)),
		y: Math.min(rangeY, Math.max(0, position.y)),
	});

	const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
		if (event.button !== 0) return;
		const card = event.currentTarget.getBoundingClientRect();
		event.currentTarget.setPointerCapture(event.pointerId);
		setDrag({ id, offsetX: event.clientX - card.left, offsetY: event.clientY - card.top });
	};

	const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!drag || !plotElement.current) return;
		const plot = plotElement.current.getBoundingClientRect();
		setDragPosition(
			clampToPlot({
				x: event.clientX - plot.left - drag.offsetX,
				y: event.clientY - plot.top - drag.offsetY,
			}),
		);
	};

	const onPointerUp = () => {
		if (drag && dragPosition) onStakeholderMove(drag.id, toValues(dragPosition));
		setDrag(null);
		setDragPosition(null);
	};

	const sorted = [...stakeholders].sort(
		(a, b) =>
			a.affecting_the_decision +
			a.affected_by_the_decision -
			(b.affecting_the_decision + b.affected_by_the_decision),
	);

	return (
		<div className='flex min-h-0 flex-1 gap-2'>
			<div className='text-text-tertiary flex shrink-0 flex-col items-center justify-between pb-[23px] text-xs font-medium whitespace-nowrap'>
				<span>High (1) ↑</span>
				<span className='text-text-default rotate-180 text-sm [writing-mode:vertical-rl]'>
					Affected by the decision
				</span>
				<span>Low (0)</span>
			</div>
			<div className='flex min-w-0 flex-1 flex-col gap-2'>
				<div
					ref={node => {
						plotRef(node);
						plotElement.current = node;
					}}
					className='relative min-h-0 flex-1 border border-[#aeaeae]'
					aria-label={`Stakeholder matrix with ${stakeholders.length} stakeholders`}
				>
					<div className='grid h-full w-full grid-cols-2 grid-rows-2'>
						{quadrantOrder.map(key => (
							<div
								key={key}
								className={`border-[rgba(111,111,111,0.7)] p-3 text-[10px] font-medium tracking-[1.1px] uppercase ${stakeholderRegions[key].quadrantClassName}`}
							>
								{stakeholderRegions[key].label}
							</div>
						))}
					</div>
					{width !== null &&
						sorted.map((stakeholder, index) => {
							const id = stakeholder.stakeholder_matrix_id;
							const isDragging = drag?.id === id;
							const position =
								isDragging && dragPosition ? dragPosition : toPosition(stakeholder);
							const isFront = isDragging || hoveredId === id;
							return (
								<StakeholderCard
									key={id}
									name={stakeholder.stakeholder_name}
									role={stakeholder.stakeholder_role}
									region={getRegionKey(
										stakeholder.affecting_the_decision,
										stakeholder.affected_by_the_decision,
									)}
									className={
										isDragging
											? 'absolute cursor-grabbing select-none'
											: 'absolute cursor-grab select-none'
									}
									style={{
										left: position.x,
										top: position.y,
										zIndex: isFront ? sorted.length + 1 : index + 1,
										touchAction: 'none',
									}}
									onPointerDown={event => onPointerDown(event, id)}
									onPointerMove={onPointerMove}
									onPointerUp={onPointerUp}
									onPointerCancel={onPointerUp}
									onMouseEnter={() => setHoveredId(id)}
									onMouseLeave={() =>
										setHoveredId(current => (current === id ? null : current))
									}
								/>
							);
						})}
				</div>
				<div className='text-text-tertiary flex items-start justify-between text-xs font-medium whitespace-nowrap'>
					<span>Low (0)</span>
					<span className='text-text-default text-sm'>Affecting the decision</span>
					<span>High (1) →</span>
				</div>
			</div>
		</div>
	);
};
