import { Icon, Tooltip } from '@equinor/eds-core-react';
import { color_palette } from '@equinor/eds-icons';
import { cn } from '../../utils/cn';

type ColorPickerLauncherProps = {
	value: string;
	title: string;
	onChange: (value: string) => void;
	className?: string;
};

export const ColorPickerLauncher = ({
	value,
	title,
	onChange,
	className,
}: ColorPickerLauncherProps) => (
	<Tooltip title={title}>
		<label
			className={cn(
				'border-primary-resting hover:bg-primary-hover-alt relative flex h-8 w-12 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border',
				className,
			)}
		>
			<input
				type='color'
				value={value}
				onChange={event => onChange(event.currentTarget.value)}
				onClick={event => event.currentTarget.blur()}
				aria-label={title}
				className='absolute inset-0 size-full cursor-pointer opacity-0'
			/>
			<span
				className='border-text-tertiary pointer-events-none size-4 rounded-sm border'
				style={{ backgroundColor: value }}
			/>
			<Icon className='pointer-events-none' data={color_palette} size={16} />
		</label>
	</Tooltip>
);
