import { Menu } from '@equinor/eds-core-react';
import { Chip, ChipTone, ChipVariant, Icon } from '@equinor/eds-core-react/next';
import { check } from '@equinor/eds-icons';
import { ReactNode, useId, useState } from 'react';
import { cn } from '../../../utils/cn';

type CardLabelProps = {
	children: ReactNode;
	tone?: ChipTone;
	variant?: ChipVariant;
	className?: string;
};

export const CardLabel = ({
	children,
	tone = 'neutral',
	variant = 'default',
	className,
}: CardLabelProps) => (
	<Chip
		tone={tone}
		variant={variant}
		className={cn('cursor-inherit pointer-events-none h-7! py-0!', className)}
		tabIndex={-1}
	>
		{children}
	</Chip>
);

export const CardLabelMenu = <Value extends string>({
	title,
	label,
	value,
	options,
	onChange,
	getLabel = value => value,
	...labelProps
}: CardLabelProps & {
	title: string;
	label: string;
	value: Value;
	options: readonly Value[];
	onChange?: (value: Value) => void;
	getLabel?: (value: Value) => string;
}) => {
	const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);
	const menuId = useId();

	if (!onChange) return <CardLabel {...labelProps} />;

	return (
		<div className='pointer-events-auto flex'>
			<Chip
				{...labelProps}
				ref={setAnchor}
				data-card-action
				aria-label={label}
				aria-haspopup='menu'
				aria-expanded={open}
				aria-controls={menuId}
				dropdown
				selected={open}
				className={cn('pointer-events-auto', labelProps.className)}
				onClick={() => setOpen(!open)}
			/>
			<Menu
				id={menuId}
				open={open}
				anchorEl={anchor}
				placement='bottom-start'
				onClose={() => setOpen(false)}
				role='menu'
				aria-label={title}
				className='nodrag nopan nowheel bg-background-default! pointer-events-auto w-42! [&>div]:p-0!'
				data-no-dnd
			>
				<h5 className='text-text-tertiary px-4 py-1 text-[10px] leading-3 font-medium tracking-[1.1px]'>
					{title}
				</h5>
				{options.map(option => (
					<Menu.Item
						key={option}
						active={option === value}
						aria-current={option === value ? 'true' : undefined}
						className={cn(
							'flex! h-12! items-center px-6! py-0! text-base! leading-4! tracking-[0.2px] [&>div]:flex! [&>div]:w-full [&>div]:items-center [&>div]:justify-between [&>div]:gap-2',
							option === value
								? 'bg-primary-selected-highlight! text-primary-resting! hover:bg-primary-hover-alt!'
								: 'text-text-default! hover:bg-primary-hover-alt!',
						)}
						onClick={() => {
							if (option !== value) onChange(option);
						}}
					>
						<span>{getLabel(option)}</span>
						{option === value && <Icon data={check} size='lg' />}
					</Menu.Item>
				))}
			</Menu>
		</div>
	);
};
