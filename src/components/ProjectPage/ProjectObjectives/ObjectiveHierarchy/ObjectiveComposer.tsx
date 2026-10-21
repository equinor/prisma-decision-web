import { Button, Icon, Textarea, TextField } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClickAway } from '@uidotdev/usehooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { useCreateObjectiveOptimistic } from '../../../../hooks/api/useCreateObjective';
import { useSelectedProjectObjectives } from '../../../../hooks/useSelectedProjectObjectives';
import { ObjectiveType } from '../../../../validators';
import { useSelectedProject } from '../../ProjectContext';

export type ComposerPosition = 'top' | 'bottom';

const composerSchema = z.object({
	name: z.string().trim().min(1, 'Objective name is required'),
	description: z.string().trim().min(1, 'Description is required'),
});

export const ObjectiveComposer = ({
	type,
	label,
	position,
	onClose,
	onCreated,
}: {
	type: ObjectiveType;
	label: string;
	position: ComposerPosition;
	onClose: () => void;
	onCreated: (id: string) => void;
}) => {
	const title = `NEW ${label.toUpperCase()} OBJECTIVE`;
	const project = useSelectedProject();
	const { selectedObjectives } = useSelectedProjectObjectives();
	const { mutate: createObjective, isPending } = useCreateObjectiveOptimistic({});
	const {
		register,
		handleSubmit,
		formState: { errors, isValid, isDirty },
	} = useForm({
		defaultValues: { name: '', description: '' },
		resolver: zodResolver(composerSchema),
		mode: 'onTouched',
	});
	const formRef = useClickAway<HTMLFormElement>(event => {
		if (
			!isDirty &&
			event.target instanceof Element &&
			!event.target.closest('button:disabled')
		) {
			onClose();
		}
	});

	const onSubmit = handleSubmit(({ name, description }) => {
		const orderings = selectedObjectives.map(objective => objective.ordering);
		const id = crypto.randomUUID();
		createObjective({
			id,
			project_id: project.id,
			name,
			description,
			type,
			ordering:
				position === 'top' ? Math.min(0, ...orderings) - 1 : Math.max(-1, ...orderings) + 1,
		});
		onCreated(id);
	});

	return (
		<form
			ref={formRef}
			aria-label={title}
			noValidate
			className='bg-background-default border-primary-resting shadow-raised relative z-20
				flex w-full flex-col gap-2.5 rounded-sm border-2 px-3 pt-2 pb-3'
			onSubmit={onSubmit}
			onClick={event => event.stopPropagation()}
			onKeyDown={event => {
				if (event.key === 'Escape') onClose();
			}}
		>
			<div className='flex items-center justify-between'>
				<h4 className='text-text-tertiary text-[10px] font-medium tracking-[1.1px]'>
					{title}
				</h4>
				<Button
					variant='ghost_icon'
					type='button'
					className='size-8!'
					aria-label='Close new objective'
					onClick={onClose}
				>
					<Icon data={close} size={18} />
				</Button>
			</div>
			<fieldset disabled={isPending} className='flex min-w-0 flex-col gap-2'>
				<TextField
					id={`new-objective-name-${type}-${position}`}
					label='Name'
					autoFocus
					placeholder='Short title for the objective'
					variant={errors.name ? 'error' : undefined}
					helperText={errors.name?.message}
					{...register('name')}
				/>
				<Textarea
					id={`new-objective-description-${type}-${position}`}
					label='Description'
					rows={2}
					placeholder='What does this objective aim for, and why?'
					variant={errors.description ? 'error' : undefined}
					helperText={errors.description?.message}
					{...register('description')}
				/>
				<div className='flex justify-end'>
					<Button type='submit' disabled={!isValid || isPending} aria-busy={isPending}>
						Add
					</Button>
				</div>
			</fieldset>
		</form>
	);
};
