import { Tooltip } from '@equinor/eds-core-react';
import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import {
	STAKEHOLDER_CARD_HEIGHT,
	STAKEHOLDER_CARD_MAX_WIDTH,
	STAKEHOLDER_CARD_MIN_WIDTH,
	stakeholderRegions,
	StakeholderRegionKey,
} from './stakeholderRegions';

type StakeholderCardProps = HTMLAttributes<HTMLDivElement> & {
	name: string;
	role: string;
	region: StakeholderRegionKey;
};

/** Card on the matrix grid. Hugs content between 80 and 160 px; never scales. */
export const StakeholderCard = forwardRef<HTMLDivElement, StakeholderCardProps>(
	({ name, role, region, className, style, ...rest }, ref) => (
		<Tooltip title={`${name} — ${role}`} placement='top'>
			<div
				ref={ref}
				className={cn(
					'bg-background-default shadow-raised flex items-center rounded-[3px] border-[0.5px] border-[#d4d4d4]',
					className,
				)}
				style={{
					height: STAKEHOLDER_CARD_HEIGHT,
					minWidth: STAKEHOLDER_CARD_MIN_WIDTH,
					maxWidth: STAKEHOLDER_CARD_MAX_WIDTH,
					...style,
				}}
				{...rest}
			>
				<span
					className='h-full w-[3px] shrink-0'
					style={{ backgroundColor: stakeholderRegions[region].accent }}
				/>
				<span className='flex min-w-0 flex-col justify-center px-1.5 leading-4 font-medium whitespace-nowrap'>
					<span className='truncate text-xs'>{name}</span>
					<span className='text-text-tertiary truncate text-[10px]'>{role}</span>
				</span>
			</div>
		</Tooltip>
	),
);
StakeholderCard.displayName = 'StakeholderCard';
