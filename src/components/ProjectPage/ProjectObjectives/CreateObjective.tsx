import { Button, TextField } from '@equinor/eds-core-react/next';
import { useFormState, useWatch } from 'react-hook-form';
import { useObjectiveForm } from '../../../hooks/useObjectiveForm';
import { objectiveTypes } from '../../../validators';
import { SegmentedSelector } from '../../common/SegmentedSelector';

export const CreateObjective = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		isPending,
		control,
	} = useObjectiveForm();
	const { isValid } = useFormState({ control });
	const type = useWatch({ control, name: 'type' });
	const pending = isSubmitting || isPending;

	return (
		<form aria-label='Create objective' className='w-full' onSubmit={handleSubmit}>
			<fieldset
				disabled={pending}
				className='grid w-full items-start gap-3 [@media(min-width:1130px)]:grid-cols-[minmax(180px,1fr)_minmax(240px,1.4fr)_240px_auto]'
			>
				<TextField
					aria-label='Objective name'
					placeholder='Objective name (required)'
					{...register('name')}
					invalid={!!errors.name}
					helperMessage={errors.name?.message}
				/>
				<TextField
					aria-label='Description'
					placeholder='Description (required)'
					{...register('description')}
					invalid={!!errors.description}
					helperMessage={errors.description?.message}
				/>
				<SegmentedSelector
					label='Objective type'
					{...register('type')}
					value={type}
					compact
					options={objectiveTypes.map(value => ({ value, label: value }))}
				/>
				<Button type='submit' disabled={!isValid || pending} aria-busy={pending}>
					Create objective
				</Button>
			</fieldset>
		</form>
	);
};
