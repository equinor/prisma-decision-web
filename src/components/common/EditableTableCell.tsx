import { Table } from '@equinor/eds-core-react';
import { useState, type ComponentProps } from 'react';
import { cn } from '../../utils/cn';

type EditableTableCellProps = Omit<
	ComponentProps<typeof Table.Cell>,
	'children' | 'onChange' | 'onBlur'
> & {
	value: string;
	onChange?: (value: string) => void;
	onBlur?: (value: string) => void;
};

export const EditableTableCell = ({
	value,
	onChange,
	onBlur,
	'aria-label': ariaLabel,
	className,
	...cellProps
}: EditableTableCellProps) => {
	const [editValue, setEditValue] = useState<string | null>(null);
	const label = ariaLabel ?? (value ? `Edit ${value}` : 'Edit cell');

	return (
		<Table.Cell
			{...cellProps}
			className={cn(
				'p-0!',
				className,
				editValue === null ? 'hover:bg-primary-hover-alt!' : 'bg-background-light!',
			)}
		>
			{editValue === null ? (
				<button
					type='button'
					className='focus-visible:outline-primary-resting px-medium block h-full w-full truncate text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2'
					aria-label={label}
					onClick={() => setEditValue(value)}
				>
					{value}
				</button>
			) : (
				<input
					autoFocus
					aria-label={label}
					className='caret-primary-resting px-medium block h-full w-full appearance-none border-0 bg-transparent py-0 leading-[inherit] text-inherit outline-none [font:inherit]'
					value={editValue}
					onChange={event => {
						setEditValue(event.target.value);
						onChange?.(event.target.value);
					}}
					onBlur={event => {
						onBlur?.(event.target.value);
						setEditValue(null);
					}}
					onKeyDown={event => {
						if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
							event.preventDefault();
							event.currentTarget.blur();
						}
					}}
				/>
			)}
		</Table.Cell>
	);
};
