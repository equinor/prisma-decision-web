import { Button, Icon, TextField } from '@equinor/eds-core-react/next';
import { edit, remove_outlined } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useRef, useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { cn } from '../../../utils/cn';

export const IssueCardEditableState = ({
	index,
	isNew,
	onSubmit,
	onRemove,
}: {
	index: number;
	isNew: boolean;
	onSubmit: () => Promise<void>;
	onRemove: () => void;
}) => {
	const rowRef = useRef<HTMLLIElement>(null);
	const [editing, setEditing] = useState<'name' | 'utility' | null>(isNew ? 'name' : null);
	const { control, register, resetField, getFieldState } = useIssueFormContext();
	const { errors } = useFormState({ control });
	const issueType = useWatch({ control, name: 'type' });
	const name = issueType === 'Uncertainty' ? 'uncertainty.outcomes' : 'decision.options';
	const state = useWatch({ control, name: `${name}.${index}` });
	const stateType = name === 'decision.options' ? 'option' : 'outcome';
	const error =
		name === 'decision.options'
			? errors.decision?.options?.[index]
			: errors.uncertainty?.outcomes?.[index];

	const save = async () => {
		await onSubmit();
		if (getFieldState(`${name}.${index}`).invalid) return;
		setEditing(null);
	};

	useHotkey(
		'Enter',
		event => {
			if (event.target instanceof HTMLInputElement) {
				event.preventDefault();
				save();
			}
		},
		{
			target: rowRef,
			enabled: editing !== null,
			ignoreInputs: false,
			preventDefault: false,
			stopPropagation: false,
		},
	);

	const cancel = () => {
		if (isNew) return onRemove();
		resetField(`${name}.${index}.name`);
		resetField(`${name}.${index}.utility`);
		setEditing(null);
	};

	useHotkey('Escape', cancel, {
		target: rowRef,
		enabled: editing !== null,
		ignoreInputs: false,
	});

	return (
		<li
			ref={rowRef}
			className={cn('group pointer-events-auto rounded-sm', {
				'bg-background-light hover:bg-primary-hover-alt focus-within:bg-primary-hover-alt px-2 py-1':
					!editing,
			})}
		>
			{editing ? (
				<fieldset
					data-no-dnd='true'
					className='nodrag nopan [&_input:not(:disabled)]:text-text-default! grid grid-cols-[minmax(0,1fr)_5rem_auto] items-start gap-2'
					onBlur={event => {
						if (!event.currentTarget.contains(event.relatedTarget)) save();
					}}
				>
					{/* Remove precedes Name in tab order, keeping Name → Utility → next Name. */}
					<Button
						type='button'
						variant='ghost'
						tone='neutral'
						icon
						className='col-start-3 row-start-1'
						aria-label={`Remove ${stateType}`}
						onClick={onRemove}
					>
						<Icon data={remove_outlined} size='md' />
					</Button>
					<TextField
						aria-label='Name'
						className='col-start-1 row-start-1'
						{...register(`${name}.${index}.name`)}
						invalid={!!error?.name}
						helperMessage={error?.name && `${error.name.message} · Esc to cancel`}
						autoFocus={editing === 'name'}
					/>
					<TextField
						aria-label='Utility'
						className='col-start-2 row-start-1'
						type='number'
						step='any'
						{...register(`${name}.${index}.utility`, { setValueAs: Number })}
						invalid={!!error?.utility}
						helperMessage={error?.utility?.message}
						autoFocus={editing === 'utility'}
					/>
				</fieldset>
			) : (
				<div className='flex items-center justify-between gap-2'>
					<Button
						type='button'
						variant='ghost'
						tone='neutral'
						size='small'
						data-card-action
						aria-label={`Edit ${stateType} name: ${state.name}`}
						className='h-5! min-h-0! min-w-0 flex-1 cursor-pointer justify-start! gap-1! p-0! text-inherit! [font:inherit]! hover:bg-transparent!'
						onFocus={() => setEditing('name')}
						onClick={() => setEditing('name')}
					>
						<span className='truncate'>{state.name}</span>
						<Icon
							data={edit}
							size='sm'
							className='text-primary-resting hidden size-4! shrink-0 group-focus-within:inline-flex group-hover:inline-flex'
						/>
					</Button>
					<Button
						type='button'
						variant='ghost'
						tone='neutral'
						size='small'
						data-card-action
						aria-label={`Edit ${stateType} utility: ${state.name}`}
						className='h-5! min-h-0! cursor-pointer p-0! text-inherit! [font:inherit]! hover:bg-transparent!'
						onFocus={() => setEditing('utility')}
						onClick={() => setEditing('utility')}
					>
						{state.utility}
					</Button>
				</div>
			)}
		</li>
	);
};
