import { DatePicker, Switch, Textarea } from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { FormProvider, useController } from 'react-hook-form';
import { useProjectForm } from '../../../hooks/useProjectForm';
import { FormErrorMessage } from '../FormErrorMessage';
import { ProjectNameField } from './ProjectNameField';
import { UserSection } from './UserSection';
import { parseISO } from 'date-fns';

export const ProjectInformation = () => {
	const { formMethods, handleSubmit } = useProjectForm();
	const {
		register,
		formState: { errors },
	} = formMethods;

	const {
		field: { value: endDate, onChange: onChangeEndDate },
	} = useController({
		name: 'end_date',
		control: formMethods.control,
	});
	return (
		<FormProvider {...formMethods}>
			<form className='flex flex-col gap-4'>
				<div
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
						<ProjectNameField
							register={register}
							errors={errors}
							onBlur={() => {
								handleSubmit();
							}}
						/>
						<div>
							<DatePicker
								label='Select End Date'
								value={parseISO(endDate)}
								onChange={endDate => {
									if (endDate) {
										onChangeEndDate(endDate.toISOString());
										handleSubmit();
									}
								}}
							/>
							<ErrorMessage as={FormErrorMessage} name='end_date' errors={errors} />
						</div>
						<Switch
							label='Make Project Public'
							{...register('public')}
							onChange={() => handleSubmit()}
						/>
						<div className='col-span-1 md:col-span-2'>
							<Textarea
								rows={5}
								label='Opportunity Statement'
								placeholder='Enter opportunity statement...'
								{...register('opportunity_statement')}
								onBlur={() => {
									handleSubmit();
								}}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name='opportunity_statement'
								errors={errors}
							/>
						</div>
					</div>
				</div>

				<UserSection handleSubmit={handleSubmit} />
			</form>
		</FormProvider>
	);
};
