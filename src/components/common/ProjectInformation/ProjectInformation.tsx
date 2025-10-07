import { Button, CircularProgress, DatePicker, Switch, TextField } from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { FormProvider } from 'react-hook-form';
import { useProjectForm } from '../../../hooks/useProjectForm';
import { FormErrorMessage } from '../FormErrorMessage';
import { UserSection } from './UserSection';

export const ProjectInformation = () => {
	const { formMethods, isPending, handleSubmit } = useProjectForm();
	const {
		register,
		formState: { errors },
	} = formMethods;

	return (
		<FormProvider {...formMethods}>
			<form
				onSubmit={handleSubmit}
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
			>
				<div>
					<h2 className='text-2xl font-semibold'>Project Information</h2>
					<p className='text-text-tertiary'>
						Enter the basic information about your decision optimization project
					</p>
				</div>
				<div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2'>
					<div>
						<TextField
							label='Project Name'
							placeholder='Enter project name...'
							{...register('name')}
						/>
						<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
					</div>
					<DatePicker
						label='Select End Date'
						value={formMethods.watch('endDate')}
						onChange={endDate => {
							if (endDate) {
								formMethods.setValue('endDate', endDate);
							}
						}}
					/>
					<Switch label='Make Project Public' {...register('isPublic')} />
					<div className='col-span-1 md:col-span-2'>
						<TextField
							multiline
							rows={5}
							label='Description'
							placeholder='Enter description...'
							{...register('description')}
						/>
						<ErrorMessage as={FormErrorMessage} name='description' errors={errors} />
					</div>
				</div>

				<UserSection />
				<Button
					className='col-span-1 md:col-span-2 md:-col-end-1 md:w-max md:place-self-end'
					type='submit'
					disabled={isPending}
				>
					{isPending ? <CircularProgress size={24} /> : 'Save'}
				</Button>
			</form>
		</FormProvider>
	);
};
