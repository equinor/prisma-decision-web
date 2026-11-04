import { Feedback } from '@dnd-kit/dom';
import { useDraggable } from '@dnd-kit/react';
import { Tooltip } from '@equinor/eds-core-react';
import { useState } from 'react';
import { cn } from '../../../utils/cn';
import type { StakeholderMatrixEntry } from '../../../validators';
import {
	clampAxisValue,
	getRegionKey,
	STAKEHOLDER_CARD_HEIGHT,
	STAKEHOLDER_CARD_MAX_WIDTH,
	STAKEHOLDER_CARD_MIN_WIDTH,
	stakeholderRegions,
} from './stakeholderRegions';

type StakeholderCardProps = {
	stakeholder: StakeholderMatrixEntry;
	zIndex: number;
	frontZIndex: number;
};

/** Card on the matrix grid. Hugs content between 80 and 160 px; never scales. */
export const StakeholderCard = ({ stakeholder, zIndex, frontZIndex }: StakeholderCardProps) => {
	const { ref, handleRef, isDragging } = useDraggable({
		id: stakeholder.stakeholder_matrix_id,
		plugins: [Feedback.configure({ dropAnimation: null })],
	});
	const [isHovered, setIsHovered] = useState(false);
	const x = clampAxisValue(stakeholder.affecting_the_decision);
	const y = 1 - clampAxisValue(stakeholder.affected_by_the_decision);
	const region = getRegionKey(
		stakeholder.affecting_the_decision,
		stakeholder.affected_by_the_decision,
	);

	return (
		<div
			ref={ref}
			className='pointer-events-none absolute w-max'
			style={{
				maxWidth: STAKEHOLDER_CARD_MAX_WIDTH,
				height: STAKEHOLDER_CARD_HEIGHT,
				left: `${x * 100}%`,
				top: `${y * 100}%`,
				transform: `translate(${-x * 100}%, ${-y * 100}%)`,
				zIndex: isDragging || isHovered ? frontZIndex : zIndex,
			}}
		>
			<Tooltip
				title={`${stakeholder.stakeholder_name} — ${stakeholder.stakeholder_role}`}
				placement='top'
			>
				<div
					ref={handleRef}
					className={cn(
						'bg-background-default shadow-raised pointer-events-auto flex w-max touch-none items-center rounded-[3px] border-[0.5px] border-[#d4d4d4] select-none',
						isDragging ? 'cursor-grabbing' : 'cursor-grab',
					)}
					style={{
						height: STAKEHOLDER_CARD_HEIGHT,
						minWidth: STAKEHOLDER_CARD_MIN_WIDTH,
						maxWidth: STAKEHOLDER_CARD_MAX_WIDTH,
					}}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					<span
						className='h-full w-[3px] shrink-0'
						style={{ backgroundColor: stakeholderRegions[region].accent }}
					/>
					<span className='flex min-w-0 flex-col justify-center px-1.5 leading-4 font-medium whitespace-nowrap'>
						<span className='truncate text-xs'>{stakeholder.stakeholder_name}</span>
						<span className='text-text-tertiary truncate text-[10px]'>
							{stakeholder.stakeholder_role}
						</span>
					</span>
				</div>
			</Tooltip>
		</div>
	);
};
