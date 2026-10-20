import { Radio, RadioGroup, RadioProvider } from '@ariakit/react';
import { Radio as EdsRadio, Tooltip } from '@equinor/eds-core-react/next';
import { ChangeEventHandler, FocusEventHandler, ReactNode, Ref, useId } from 'react';
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

	return (
		<RadioProvider value={value}>
			<RadioGroup
				render={<fieldset />}
				className='w-full min-w-0'
				aria-describedby={description ? descriptionId : undefined}
			>
				<legend className={compact ? 'sr-only' : 'text-text-secondary mb-1 text-sm'}>
					{label}
				</legend>
				<div
					className={cn(
						'flex gap-0.5 rounded-sm max-[480px]:flex-wrap [&>.eds-tooltip-anchor]:min-w-max [&>.eds-tooltip-anchor]:flex-1 max-[480px]:[&>.eds-tooltip-anchor]:basis-[calc(100%/3-2px)] [&>.eds-tooltip-anchor>.eds-radio]:w-full',
						!compact && 'border-background-medium border',
					)}
				>
					{options.map(option => (
						<Tooltip key={option.value} title={option.tooltip}>
							<Radio
								render={<EdsRadio label={option.label} />}
								className='has-[input:focus-visible]:outline-primary-resting relative min-w-max flex-1 gap-0!
								rounded-[3px]! p-0! text-(--eds-color-text-accent-subtle)! has-[input:checked]:bg-(--eds-color-bg-accent-fill-muted-hover)!
								has-[input:disabled]:opacity-50 has-[input:focus-visible]:z-1 has-[input:focus-visible]:outline-2
								has-[input:focus-visible]:outline-offset-2 max-[480px]:basis-[calc(100%/3-2px)]
								[&:has(input:disabled)>label]:cursor-default! [&>.icon-wrapper]:hidden! [&>label]:m-0!
								[&>label]:flex! [&>label]:min-h-9! [&>label]:w-full! [&>label]:cursor-pointer!
								[&>label]:items-center! [&>label]:justify-center! [&>label]:gap-1! [&>label]:p-1! [&>label]:text-sm!
								[&>label]:text-inherit! max-[480px]:[&>label]:gap-0.5! max-[480px]:[&>label]:text-xs!'
								name={name}
								value={option.value}
								checked={value === option.value}
								ref={ref}
								onChange={onChange}
								onBlur={onBlur}
							/>
						</Tooltip>
					))}
				</div>
				{description && (
					<p id={descriptionId} className='text-text-tertiary mt-1 text-xs'>
						{description}
					</p>
				)}
			</RadioGroup>
		</RadioProvider>
	);
};

type SegmentedSelectorProps<Value extends string> = {
	label: string;
	name: string;
	value: Value;
	options: readonly { value: Value; label: ReactNode; tooltip?: string }[];
	onChange?: ChangeEventHandler<HTMLInputElement>;
	onBlur?: FocusEventHandler<HTMLInputElement>;
	ref?: Ref<HTMLInputElement>;
	description?: string;
	compact?: boolean;
};
