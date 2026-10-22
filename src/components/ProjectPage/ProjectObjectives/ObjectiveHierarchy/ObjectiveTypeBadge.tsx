import { Icon } from '@equinor/eds-core-react';
import { build_wrench, flag, star_outlined } from '@equinor/eds-icons';
import { cn } from '../../../../utils/cn';
import { ObjectiveType } from '../../../../validators';

const typeIcons: Record<ObjectiveType, typeof flag> = {
	Strategic: flag,
	Fundamental: star_outlined,
	Mean: build_wrench,
};

export const ObjectiveTypeBadge = ({ type }: { type: ObjectiveType }) => (
	<span
		className={cn(
			'flex size-6 shrink-0 items-center justify-center rounded-sm border',
			type === 'Fundamental'
				? 'border-accent-border bg-accent-canvas'
				: 'bg-background-light border-[#aeaeae]',
		)}
	>
		<Icon data={typeIcons[type]} size={16} className='fill-text-default' />
	</span>
);
