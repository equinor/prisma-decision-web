import { Icon } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { cn } from '../../utils/cn';

// Animated "+" connector visual. Expects a `group/node` ancestor (reveal) and a `group/connector` ancestor (hover).
export const ConnectorGlyph = ({
	open,
	side = 'right',
}: {
	open: boolean;
	side?: 'left' | 'right';
}) => (
	// Transitions use `!` to beat the global `* { transition: ... !important }` in index.css
	// Slides out from under the node (the node surface must be painted on top)
	<span
		className={cn(
			'pointer-events-none relative flex size-7 items-center justify-center',
			open
				? 'translate-x-0 opacity-100'
				: `opacity-0
					[transition:translate_185ms_cubic-bezier(0.4,0,1,1),opacity_65ms_linear_135ms]!
					group-hover/node:translate-x-0 group-hover/node:opacity-100
					group-hover/node:[transition:translate_375ms_cubic-bezier(0.34,1.4,0.64,1),opacity_85ms_ease-out]!`,
			!open && (side === 'right' ? '-translate-x-10' : 'translate-x-10'),
		)}
	>
		{/* Background grows from the small dot (22px) into the full button (28px) */}
		<span
			className={cn(
				`absolute inset-0 rounded-full border
				[transition:scale_350ms_cubic-bezier(0.34,1.6,0.64,1),background-color_200ms_ease-out,border-color_200ms_ease-out]!`,
				open
					? 'bg-diagram-connector-hover border-diagram-connector scale-100'
					: `bg-background-default group-hover/connector:bg-diagram-connector-hover group-hover/connector:border-diagram-connector
						scale-[0.786]
						border-transparent group-hover/connector:scale-100`,
			)}
		/>
		<span
			className={cn(
				`border-diagram-connector absolute size-3 rounded-full border-2
				[transition:scale_300ms_cubic-bezier(0.2,0,0,1),opacity_200ms_ease-out]!`,
				open
					? 'scale-[2.33] opacity-0'
					: 'group-hover/connector:scale-[2.33] group-hover/connector:opacity-0',
			)}
		/>
		<span
			className={cn(
				`relative flex
				[transition:scale_350ms_cubic-bezier(0.34,1.6,0.64,1),rotate_350ms_cubic-bezier(0.34,1.6,0.64,1),opacity_150ms_ease-out]!`,
				open
					? 'scale-100 rotate-0 opacity-100'
					: `scale-0 -rotate-90 opacity-0 group-hover/connector:scale-100
						group-hover/connector:rotate-0 group-hover/connector:opacity-100`,
			)}
		>
			<Icon data={add} size={18} className='fill-diagram-connector' />
		</span>
	</span>
);
