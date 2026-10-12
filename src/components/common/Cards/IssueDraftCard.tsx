import { Button, Icon, TextArea, TextField } from '@equinor/eds-core-react/next';
import { close } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useClickAway } from '@uidotdev/usehooks';
import { FormEvent } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { useGetIssues } from '../../../hooks/api/useGetIssues';
import { useIssueForm } from '../../../hooks/useIssueForm';
import { IssueType } from '../../../validators';
import { SegmentedSelector } from '../SegmentedSelector';

export const IssueDraftCard = ({
	issueType = 'Unassigned',
	position,
	onClose,
	onCreated = onClose,
}: {
	issueType?: IssueType;
	position?: 'top' | 'bottom';
	onClose: () => void;
	onCreated?: () => void;
}) => {
	const title = `NEW ${issueType.toUpperCase()}`;
	const { issues } = useGetIssues();
	const {
		register,
		control,
		getValues,
		setValue,
		onSubmit: submitIssue,
		isPending,
	} = useIssueForm({
		issueType,
		onSuccess: onCreated,
	});
	const { errors, isValid, isDirty, isSubmitting } = useFormState({ control });
	const boundary = useWatch({ control, name: 'boundary' });
	const pending = isPending || isSubmitting;
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (pending) return;
		if (position) {
			const { project_id, type } = getValues();
			const orders = issues
				.filter(issue => issue.project_id === project_id && issue.type === type)
				.map(issue => issue.order);
			const order =
				orders.length === 0
					? 0
					: position === 'top'
						? Math.min(...orders) - 1
						: Math.max(...orders) + 1;
			setValue('order', order);
		}
		return submitIssue(event);
	};
	useHotkey('Escape', onClose);
	const formRef = useClickAway<HTMLFormElement>(event => {
		if (
			!isDirty &&
			event.target instanceof Element &&
			!event.target.closest('button:disabled')
		) {
			onClose();
		}
	});

	return (
		<form
			ref={formRef}
			aria-label={title}
			noValidate
			className='bg-background-default border-primary shadow-raised flex flex-col gap-2.5 rounded-sm border-2 px-3 pt-2 pb-3'
			onSubmit={onSubmit}
		>
			<div className='flex items-center justify-between'>
				<h4 className='text-text-tertiary text-[10px] font-medium tracking-[1.1px]'>
					{title}
				</h4>
				<Button
					icon
					variant='ghost'
					type='button'
					aria-label='Close new issue'
					onClick={onClose}
				>
					<Icon data={close} />
				</Button>
			</div>
			<fieldset disabled={isPending} className='flex min-w-0 flex-col gap-2'>
				<TextField
					label='Name'
					{...register('name')}
					invalid={!!errors.name}
					helperMessage={errors.name?.message}
					required
					autoFocus
					placeholder='Short name for the issue'
				/>
				<TextArea
					label='Description'
					{...register('description')}
					invalid={!!errors.description}
					helperMessage={errors.description?.message}
					required
					rows={2}
					placeholder='What should be decided, and why?'
				/>
				<div className='flex items-end justify-between gap-2'>
					<SegmentedSelector
						label='Boundary'
						{...register('boundary')}
						value={boundary}
						compact
						options={[
							{ value: 'in', label: 'In' },
							{ value: 'on', label: 'On' },
							{ value: 'out', label: 'Out' },
						]}
					/>
					<Button type='submit' disabled={!isValid || pending} aria-busy={pending}>
						Add
					</Button>
				</div>
			</fieldset>
		</form>
	);
};
