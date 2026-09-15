import { Menu, Table } from '@equinor/eds-core-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type DropdownTableCellProps<T extends string> = Omit<
	ComponentProps<typeof Table.Cell>,
	'children' | 'onChange' | 'onBlur'
> & {
	value: T;
	options: readonly T[];
	onChange?: (value: T) => void;
	onBlur?: (value: T) => void;
	renderValue?: (value: T) => ReactNode;
};

export const DropdownTableCell = <T extends string>({
	value,
	options,
	onChange,
	onBlur,
	renderValue,
	'aria-label': ariaLabel,
	className,
	...cellProps
}: DropdownTableCellProps<T>) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const label = ariaLabel ?? `Change ${value}`;

	const handleClose = () => {
		setIsOpen(false);
		onBlur?.(value);
	};

	return (
		<Table.Cell
			{...cellProps}
			className={cn(
				'p-0!',
				className,
				isOpen ? 'bg-primary-selected-highlight!' : 'hover:bg-primary-hover-alt!',
			)}
		>
			<button
				ref={setAnchorEl}
				type='button'
				className='focus-visible:outline-primary-resting px-medium block h-full w-full truncate text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2'
				aria-label={label}
				aria-haspopup='menu'
				aria-expanded={isOpen}
				onClick={() => setIsOpen(true)}
			>
				{renderValue?.(value) ?? value}
			</button>
			<Menu
				open={isOpen}
				anchorEl={anchorEl}
				placement='bottom-start'
				matchAnchorWidth
				onClose={handleClose}
			>
				{options.map(option => (
					<Menu.Item
						key={option}
						active={option === value}
						onClick={() => {
							onChange?.(option);
							setIsOpen(false);
							onBlur?.(option);
						}}
					>
						{option}
					</Menu.Item>
				))}
			</Menu>
		</Table.Cell>
	);
};
