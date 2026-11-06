import { Button, Icon, TextArea, TextField } from '@equinor/eds-core-react/next';
import { edit } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useRef, useState } from 'react';
import { useFormState } from 'react-hook-form';
import { useIssueForm } from '../../../hooks/useIssueForm';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';
import { showSuccessToast } from '../../ShowToast';

export const IssueTextField = ({
	issue,
	field,
	className,
	showHint,
	variant = 'table',
}: {
	issue: Issue;
	field: 'name' | 'description';
	className?: string;
	showHint?: boolean;
	variant?: 'card' | 'table';
}) => {
	const [editing, setEditing] = useState(false);
	const editorRef = useRef<HTMLDivElement>(null);
	const restoreFocusRef = useRef(false);
	const { register, control, reset, getFieldState, getValues, onSubmit } = useIssueForm({
		issue,
		optimistic: true,
		onSuccess: () =>
			showSuccessToast(field === 'name' ? 'Name updated' : 'Description updated'),
	});
	const { errors } = useFormState({ control });
	const error = errors[field]?.message;
	const label = field === 'name' ? 'Issue name' : 'Issue description';
	const multiline = field === 'description';
	const keyboardHint = showHint
		? `Enter to save · Esc to cancel${multiline ? ' · Shift+Enter for a newline' : ''}`
		: undefined;

	const save = async () => {
		if (getValues(field) !== issue[field]) await onSubmit();
		if (!getFieldState(field).invalid) setEditing(false);
	};

	const hotkeyOptions = {
		target: editorRef,
		enabled: editing,
		ignoreInputs: false,
		preventDefault: false,
		stopPropagation: false,
	};
	useHotkey(
		'Enter',
		event => {
			if (event.isComposing || event.keyCode === 229) return;
			event.preventDefault();
			event.stopPropagation();
			void save();
		},
		hotkeyOptions,
	);
	useHotkey(
		'Escape',
		event => {
			if (event.isComposing || event.keyCode === 229) return;
			event.preventDefault();
			event.stopPropagation();
			restoreFocusRef.current = true;
			setEditing(false);
		},
		hotkeyOptions,
	);

	if (editing) {
		const Editor = multiline ? TextArea : TextField;
		const inputProps = register(field);
		return (
			<div
				ref={editorRef}
				className={cn('nodrag nopan pointer-events-auto', {
					'flex min-h-12 items-center px-2': variant === 'table',
					'pt-1': variant === 'card' && multiline,
					'pb-1': variant === 'card',
				})}
				data-no-dnd='true'
			>
				<Editor
					aria-label={label}
					className={cn(
						'[&_input:not(:disabled)]:text-text-default! text-sm font-normal',
						{
							'[&_.helper-message]:text-text-tertiary!': !error,
							'[&_.eds-input]:min-h-13.5! [&_.eds-input]:py-1.5!':
								multiline && variant === 'card',
							'[&_.eds-input]:[--eds-container-space-vertical:var(--eds-selectable-space-vertical)]!':
								multiline && variant === 'table',
						},
					)}
					{...(multiline ? { rows: variant === 'table' ? 1 : 2 } : {})}
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
				/>
			</div>
		);
	}

	return (
		<Button
			ref={button => {
				if (button && restoreFocusRef.current) {
					restoreFocusRef.current = false;
					button.focus();
				}
			}}
			variant='ghost'
			size='small'
			className={cn(
				'group pointer-events-auto min-h-0! w-full justify-start! gap-1! p-0! text-left! text-inherit! [font:inherit]!',
				{
					'nodrag nopan h-12! rounded-none! border! border-transparent! px-4! hover:border-(--eds-color-border-medium)! hover:bg-(--eds-color-bg-input)! focus-visible:border-(--eds-color-border-medium)! focus-visible:bg-(--eds-color-bg-input)!':
						variant === 'table',
					'hover:bg-(--eds-color-bg-accent-fill-muted-hover)! hover:px-1! focus-visible:bg-(--eds-color-bg-accent-fill-muted-hover)! focus-visible:px-1!':
						variant === 'card',
					'h-auto! min-h-5!': variant === 'card' && multiline,
					'h-6!': variant === 'card' && !multiline,
				},
			)}
			data-no-dnd={variant === 'table' || undefined}
			data-card-action={variant === 'card' || undefined}
			aria-label={`Edit ${label.toLowerCase()}: ${issue[field]}`}
			onClick={() => {
				reset(issue);
				setEditing(true);
			}}
		>
			<span className={cn('min-w-0 flex-1', className)}>{issue[field]}</span>
			<Icon
				data={edit}
				size='sm'
				className='text-primary-resting hidden size-4! shrink-0 group-hover:inline-flex group-focus-visible:inline-flex'
			/>
		</Button>
	);
};
