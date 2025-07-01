import { Button, Icon, TextField } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { useOppportunityForm } from '../../../hooks/useOppportunityForm';

export const OpportunityStatmentsForm = () => {
	const { register, handleSubmit } = useOppportunityForm();

	return (
		<form className='grid w-full md:grid-cols-[1fr_1fr_auto] md:gap-4' onSubmit={handleSubmit}>
			<TextField label='Name' placeholder='Enter opportunity name...' {...register('name')} />
			<TextField
				label='Description'
				placeholder='Enter opportunity description...'
				{...register('description')}
			/>
			<Button className='mt-4!' type='submit'>
				<Icon data={add} />
				Add
			</Button>
		</form>
	);
};
