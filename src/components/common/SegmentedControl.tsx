import { cn } from '../../utils/cn';

export const SegmentedControl = <T extends string>({
	label,
	options,
	value,
	onChange,
}: SegmentedControlProps<T>) => (
	<div
		role='group'
		aria-label={label}
		className='border-background-medium flex gap-0.5 rounded-sm border p-0.5'
	>
		{options.map(option => (
			<button
				key={option.value}
				type='button'
				aria-pressed={value === option.value}
				className={cn(
					`text-primary-resting hover:bg-tier-fill cursor-pointer rounded-sm
					px-4 py-2 text-sm font-medium`,
					{ 'bg-tier-fill-hover!': value === option.value },
				)}
				onClick={() => onChange(option.value)}
			>
				{option.label}
			</button>
		))}
	</div>
);

type SegmentedControlProps<T extends string> = {
	label: string;
	options: readonly { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
};
