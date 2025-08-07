import { Button, Icon, TextField } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useOppportunityForm } from '../../../hooks/useOppportunityForm';
import { FormErrorMessage } from '../FormErrorMessage';

export const OpportunityStatmentsForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useOppportunityForm();

	return (
		<form className='grid w-full md:grid-cols-[1fr_1fr_auto] md:gap-4' onSubmit={handleSubmit}>
			<div>
				<TextField
					label='Name'
					placeholder='Enter opportunity name...'
					{...register('name')}
				/>
				<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
			</div>
			<div>
				<TextField
					label='Description'
					placeholder='Enter opportunity description...'
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
