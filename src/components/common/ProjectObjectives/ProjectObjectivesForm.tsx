import { Button, Icon, TextField } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useObjectiveForm } from '../../../hooks/useObjectiveForm';
import { FormErrorMessage } from '../FormErrorMessage';

export const ProjectObjectivesForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useObjectiveForm();

	return (
		<form className='grid w-full md:grid-cols-[1fr_1fr_auto] md:gap-4' onSubmit={handleSubmit}>
			<div>
				<TextField
					label='Name'
					placeholder='Enter objective name...'
					{...register('name')}
				/>
				<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
			</div>
			<div>
				<TextField
					label='Description'
					placeholder='Enter objective description...'
					{...register('description')}
				/>
				<ErrorMessage as={FormErrorMessage} name='description' errors={errors} />
			</div>
			<Button className='mt-4!' type='submit'>
				<Icon data={add} />
				Add
			</Button>
		</form>
	);
};
