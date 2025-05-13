import { Autocomplete, Button, TextField } from '@equinor/eds-core-react';

export const ProjectIssues = () => {
	return (
		<div className='mx-auto w-[456px] xl:w-[936px] 2xl:w-[1416px]'>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
                items-start gap-6 rounded-sm p-6'
			>
				<div>
					<h2 className='text-2xl font-semibold'>Project Issues</h2>
					<p className='text-text-tertiary'>
						Add and manage issues related to decisions, uncertainties, and value drivers
					</p>
				</div>
				<div className='grid w-full grid-cols-2 gap-4'>
					<TextField placeholder='Enter issue name...' label='Issue Name' />
					<TextField placeholder='Enter label...' label='Label' />
					<Autocomplete
						label='Category'
						options={['Decision', 'Uncertainty', 'Fact', 'Value', 'Unassgined']}
						initialSelectedOptions={['Decision']}
					/>
					<Autocomplete
						label='Boundry'
						options={['In', 'On', 'Out']}
						initialSelectedOptions={['In']}
					/>
					<TextField
						label='Description'
						placeholder='Enter description...'
						className='col-span-2'
						multiline
						rows={4}
					/>
				</div>
				<Button className='self-end'>Add Issue</Button>
			</div>
		</div>
	);
};
