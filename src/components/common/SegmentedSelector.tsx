import { Radio, Tooltip } from '@equinor/eds-core-react/next';
import { ChangeEventHandler, FocusEventHandler, KeyboardEvent, ReactNode, Ref, useId } from 'react';
import { cn } from '../../utils/cn';

export const SegmentedSelector = <Value extends string>({
	label,
	name,
	value,
	options,
	onChange,
	onBlur,
	ref,
	description,
	compact = false,
}: SegmentedSelectorProps<Value>) => {
	const descriptionId = useId();
	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
		let next: number;
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				next = (index + 1) % options.length;
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				next = (index + options.length - 1) % options.length;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = options.length - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		const radios = event.currentTarget
			.closest('fieldset')
			?.querySelectorAll<HTMLInputElement>('input[type="radio"]');
		radios?.[next]?.click();
		radios?.[next]?.focus();
	};

	return (
		<fieldset
			role='radiogroup'
			className='w-full min-w-0'
			aria-describedby={description ? descriptionId : undefined}
		>
			<legend className={compact ? 'sr-only' : 'text-text-secondary mb-1 text-sm'}>
				{label}
			</legend>
			<div
				className={cn(
					'flex gap-0.5 rounded-sm max-[480px]:flex-wrap [&>.eds-tooltip-anchor]:min-w-0 [&>.eds-tooltip-anchor]:flex-1 max-[480px]:[&>.eds-tooltip-anchor]:basis-[calc(100%/3-2px)] [&>.eds-tooltip-anchor>.eds-radio]:w-full',
					!compact && 'border-background-medium border p-0.5',
				)}
			>
				{options.map((option, index) => (
					<Tooltip key={option.value} title={option.tooltip}>
						<Radio
							className='has-[input:focus-visible]:outline-primary-resting relative min-w-0 flex-1 gap-0! rounded-[3px]! p-0! text-(--eds-color-text-accent-subtle)! has-[input:checked]:bg-(--eds-color-bg-accent-fill-muted-hover)! has-[input:disabled]:opacity-50 has-[input:focus-visible]:z-1 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 max-[480px]:basis-[calc(100%/3-2px)] [&:has(input:disabled)>label]:cursor-default! [&>.icon-wrapper]:hidden! [&>label]:m-0! [&>label]:flex! [&>label]:min-h-9! [&>label]:w-full! [&>label]:cursor-pointer! [&>label]:items-center! [&>label]:justify-center! [&>label]:gap-1! [&>label]:p-1! [&>label]:[font-family:Inter]! [&>label]:text-sm! [&>label]:text-inherit! max-[480px]:[&>label]:gap-0.5! max-[480px]:[&>label]:text-xs!'
							label={option.label}
							name={name}
							value={option.value}
							checked={value === undefined ? undefined : value === option.value}
							tabIndex={
								value === undefined ? undefined : value === option.value ? 0 : -1
							}
							ref={ref}
							onChange={onChange}
							onBlur={onBlur}
							onKeyDown={event => handleKeyDown(event, index)}
						/>
					</Tooltip>
				))}
			</div>
			{description && (
				<p id={descriptionId} className='text-text-tertiary mt-1 text-xs'>
					{description}
				</p>
			)}
		</fieldset>
	);
};

type SegmentedSelectorProps<Value extends string> = {
	label: string;
	name: string;
	value?: Value;
	options: readonly { value: Value; label: ReactNode; tooltip?: string }[];
	onChange?: ChangeEventHandler<HTMLInputElement>;
	onBlur?: FocusEventHandler<HTMLInputElement>;
	ref?: Ref<HTMLInputElement>;
	description?: string;
	compact?: boolean;
};
