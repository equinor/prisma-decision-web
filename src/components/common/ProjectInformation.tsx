import { Autocomplete, Button, DatePicker, TextField } from '@equinor/eds-core-react';
import { useProjectForm } from '../../hooks/useProjectForm';

export const ProjectInformation = () => {
	const { handleSubmit, register } = useProjectForm();
	return (
		<form
			onSubmit={handleSubmit}
			className='bg-background-default shadow-tile flex w-full flex-col
            items-start gap-6 rounded-sm p-6'
		>
			<div>
				<h2 className='text-2xl font-semibold'>Project Information</h2>
				<p className='text-text-tertiary'>
					Enter the basic information about your decision optimization project
				</p>
			</div>
			<div className='grid w-full grid-cols-1 gap-6 md:grid-cols-2'>
				<TextField
					label='Project Name'
					placeholder='Enter project name...'
					{...register('name')}
				/>
				<TextField label='Decision Maker' placeholder='Enter decision maker name...' />
				<DatePicker label='Select End Date' />
				<Autocomplete label='Sensitivity Level' options={['Open', 'Restricted']} />
				<TextField
					className='md:col-span-2'
					multiline
					rows={5}
					label='Description'
					placeholder='Enter description...'
					{...register('description')}
				/>
				<Button className='-col-end-1 md:w-max md:place-self-end' type='submit'>
					Save
				</Button>
			</div>
		</form>
	);
};
