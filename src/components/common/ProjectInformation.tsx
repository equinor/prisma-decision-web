import { Autocomplete, Button, DatePicker, TextField } from '@equinor/eds-core-react';

export const ProjectInformation = () => {
	return (
		<div
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
				<TextField label='Project Name' placeholder='Enter project name...' />
				<TextField label='Decision Maker' placeholder='Enter decision maker name...' />
				<DatePicker label='Select End Date' />
				<Autocomplete label='Sensitivity Level' options={['Open', 'Restricted']} />
				<TextField
					className='md:col-span-2'
					multiline
					rows={5}
					label='Description'
					placeholder='Enter description...'
				/>
				<Button className='-col-end-1 md:w-max md:place-self-end'>Save</Button>
			</div>
		</div>
	);
};
