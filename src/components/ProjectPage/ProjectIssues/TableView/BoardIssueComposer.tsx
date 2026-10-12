import { Button, Icon, TextArea, TextField } from '@equinor/eds-core-react/next';
import { close } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useClickAway } from '@uidotdev/usehooks';
import { useFormState } from 'react-hook-form';
import { useIssueForm } from '../../../../hooks/useIssueForm';
import { IssueType } from '../../../../validators';
import { SegmentedSelector } from '../../../common/SegmentedSelector';

export const BoardIssueComposer = ({
	issueType,
	position,
	onClose,
	onCreated,
}: {
	issueType: Exclude<IssueType, 'Utility'>;
	position: 'top' | 'bottom';
	onClose: () => void;
	onCreated: (id: string) => void;
}) => {
	const title = `NEW ${issueType.toUpperCase()}`;
	const { register, control, onSubmit, isPending } = useIssueForm({
		issueType,
		position,
		onSuccess: onCreated,
	});
	const { errors, isValid, isDirty, isSubmitting } = useFormState({ control });
	const pending = isPending || isSubmitting;
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
