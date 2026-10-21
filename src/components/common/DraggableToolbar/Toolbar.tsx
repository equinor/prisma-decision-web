import { Radio, RadioGroup, RadioProvider } from '@ariakit/react';
import { Popover } from '@equinor/eds-core-react';
import { Button, Tooltip } from '@equinor/eds-core-react/next';
import { ComponentProps, ReactNode, useId, useState } from 'react';
import { cn } from '../../../utils/cn';

type ToolbarProps = ComponentProps<'div'>;

export const Toolbar = ({ children, className, ...props }: ToolbarProps) => (
	<div
		{...props}
		role='toolbar'
		className={cn(
			'bg-background-default flex w-max items-center gap-3 rounded-sm px-2 py-1 shadow-[0_4px_8px_0_rgba(0,0,0,0.12),0_1px_8px_0_rgba(0,0,0,0.2)]',
			className,
		)}
	>
		{children}
	</div>
);

type ToolbarGroupProps = ComponentProps<'div'>;

export const ToolbarGroup = ({ children, className, ...props }: ToolbarGroupProps) => (
	<div {...props} role='group' className={cn('flex items-center gap-1', className)}>
		{children}
	</div>
);

type ToolbarToolGroupProps = ComponentProps<'div'>;

export const ToolbarToolGroup = ({ children, className, ...props }: ToolbarToolGroupProps) => (
	<RadioProvider>
		<RadioGroup {...props} className={cn('flex items-center gap-1', className)}>
			{children}
		</RadioGroup>
	</RadioProvider>
);

type ToolbarButtonProps = ComponentProps<'button'> & {
	active?: boolean;
	icon?: boolean;
	shortcut?: string;
	tooltip?: string;
	tone?: 'neutral' | 'accent';
};

export const ToolbarButton = ({
	active = false,
	'aria-label': ariaLabel,
	children,
	className,
	icon,
	shortcut,
	tooltip,
	tone = 'neutral',
	...props
}: ToolbarButtonProps) => {
	return (
		<Tooltip title={tooltip} disabled={!tooltip}>
			<Button
				{...props}
				icon={icon}
				aria-label={ariaLabel ?? (icon ? tooltip : undefined)}
				data-active={active || undefined}
				size='default'
				tone={tone}
				variant='ghost'
				className={cn(
					'relative h-9! min-h-9! shrink-0 rounded-sm [&>.eds-icon]:size-5! [&>svg]:size-5!',
					icon && 'size-9!',
					active && 'not-disabled:bg-(--eds-color-bg-fill-muted-hover)!',
					className,
				)}
			>
				{children}
				{shortcut && (
					<span
						aria-hidden='true'
						className={cn(
							'pointer-events-none absolute right-1 bottom-0 text-xs leading-4',
							tone === 'accent' && 'text-primary-resting',
							active && 'text-text-default',
						)}
					>
						{shortcut}
					</span>
				)}
			</Button>
		</Tooltip>
	);
};

type ToolbarToggleButtonProps = ComponentProps<'button'> & {
	icon?: boolean;
	pressed: boolean;
	onPressedChange: (pressed: boolean) => void;
	shortcut?: string;
	tooltip?: string;
	tone?: 'neutral' | 'accent';
};

export const ToolbarToggleButton = ({
	pressed,
	onPressedChange,
	...props
}: ToolbarToggleButtonProps) => (
	<ToolbarButton
		{...props}
		active={pressed}
		aria-pressed={pressed}
		onClick={() => onPressedChange(!pressed)}
	/>
);

type ToolbarToolButtonProps = ComponentProps<'button'> & {
	icon?: boolean;
	selected: boolean;
	shortcut?: string;
	tooltip?: string;
	tone?: 'neutral' | 'accent';
};

export const ToolbarToolButton = ({
	selected,
	tone = 'accent',
	...props
}: ToolbarToolButtonProps) => {
	const value = useId();

	return (
		<Radio
			value={value}
			checked={selected}
			render={<ToolbarButton {...props} tone={tone} active={selected} />}
		/>
	);
};

type ToolbarPopoverButtonProps = ComponentProps<'button'> & {
	children: ReactNode;
	contentClassName?: string;
	icon?: boolean;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
	shortcut?: string;
	tooltip?: string;
	tone?: 'neutral' | 'accent';
	trigger: ReactNode;
};

export const ToolbarPopoverButton = ({
	children,
	contentClassName,
	onOpenChange,
	open,
	trigger,
	...buttonProps
}: ToolbarPopoverButtonProps) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const triggerId = useId();
	const contentId = `${triggerId}-content`;
	const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);
	const isOpen = open ?? internalOpen;

	const setOpen = (nextOpen: boolean) => {
		if (open === undefined) setInternalOpen(nextOpen);
		onOpenChange?.(nextOpen);
	};

	return (
		<>
			<ToolbarButton
				{...buttonProps}
				ref={setAnchorElement}
				id={triggerId}
				active={isOpen}
				aria-controls={contentId}
				aria-expanded={isOpen}
				aria-haspopup='dialog'
				onClick={() => setOpen(!isOpen)}
			>
				{trigger}
			</ToolbarButton>
			<Popover
				open={isOpen}
				id={contentId}
				role='dialog'
				aria-labelledby={triggerId}
				anchorEl={anchorElement}
				trapFocus
				onClose={() => setOpen(false)}
				className='bg-background-default! rounded-sm! shadow-[0_4px_8px_0_rgba(0,0,0,0.12),0_1px_8px_0_rgba(0,0,0,0.2)]! [&>div:last-child]:max-w-none!'
			>
				<Popover.Content
					className={cn('relative w-[300px] rounded-sm p-4!', contentClassName)}
				>
					{children}
				</Popover.Content>
			</Popover>
		</>
	);
};

export const ToolbarSeparator = () => (
	<div
		role='separator'
		aria-orientation='vertical'
		className='bg-background-light h-9 w-0.5 shrink-0'
	/>
);
