import { Button, Icon, TextArea, TextField } from '@equinor/eds-core-react/next';
import { edit } from '@equinor/eds-icons';
import { useEffect, useRef, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '../../utils/cn';

export const InlineTextEditor = ({
	value,
	label,
	onSave,
	onStartEditing,
	inputProps,
	error,
	className,
	multiline,
	showHint,
	onEditingChange,
}: InlineTextEditorProps) => {
	const keyboardHint = showHint
		? `Enter to save · Esc to cancel${multiline ? ' · Shift+Enter for a newline' : ''}`
		: undefined;
	const [mode, setMode] = useState<'view' | 'editing' | 'cancelled'>('view');
	const editing = mode === 'editing';
	const triggerRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (mode === 'cancelled') {
			triggerRef.current?.focus();
		}
	}, [mode]);
	useEffect(() => {
		if (!editing) return;
		onEditingChange?.(true);
		return () => onEditingChange?.(false);
	}, [editing, onEditingChange]);

	const save = async () => {
		if (await onSave()) setMode('view');
	};

	if (editing) {
		const Editor = multiline ? TextArea : TextField;
		return (
			<div className='nodrag nopan pointer-events-auto' data-no-dnd='true'>
				<Editor
					label={label}
					autoFocus
					{...inputProps}
					invalid={!!error}
					helperMessage={
						error ? (
							<>
								<span>{error}</span>
								{' · '}
								<span>{keyboardHint ?? 'Esc to cancel'}</span>
							</>
						) : (
							keyboardHint
						)
					}
					onBlur={event => {
						void inputProps.onBlur(event);
						void save();
					}}
					onKeyDown={event => {
						if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
							return;
						if (event.key === 'Escape') {
							event.preventDefault();
							event.stopPropagation();
							setMode('cancelled');
						} else if (event.key === 'Enter' && !event.shiftKey) {
							event.preventDefault();
							event.stopPropagation();
							void save();
						}
					}}
				/>
			</div>
		);
	}

	return (
		<Button
			ref={triggerRef}
			variant='ghost'
			size='small'
			className='group nodrag nopan pointer-events-auto h-auto! min-h-0! w-full gap-0! p-0! text-left! text-inherit! [font:inherit]!'
			data-no-dnd='true'
			aria-label={`Edit ${label.toLowerCase()}: ${value}`}
			onClick={() => {
				onStartEditing();
				setMode('editing');
			}}
		>
			<span className={cn('min-w-0 flex-1', className)}>{value}</span>
			<Icon
				data={edit}
				className='shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
			/>
		</Button>
	);
};

type InlineTextEditorProps = {
	value: string;
	label: string;
	onSave: () => Promise<boolean>;
	onStartEditing: () => void;
	inputProps: UseFormRegisterReturn;
	error?: string;
	className?: string;
	multiline?: boolean;
	showHint?: boolean;
	onEditingChange?: (editing: boolean) => void;
};