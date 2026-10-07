import { DatePicker, Switch } from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { FormProvider, useController } from 'react-hook-form';
import { useProjectForm } from '../../../hooks/useProjectForm';
import { FormErrorMessage } from '../FormErrorMessage';
import { OpportunityStatementEditor } from './OpportunityStatementEditor';
import { ProjectNameField } from './ProjectNameField';
import { UserSection } from './UserSection';
import { parseISO } from 'date-fns';
import { useSelectedProject } from '../../ProjectPage/ProjectContext';

export const ProjectForm = () => {
	const selectedProject = useSelectedProject();
	const { formMethods, handleSubmit } = useProjectForm(selectedProject);
	const {
		formState: { errors },
	} = formMethods;

	const {
		field: { value: endDate, onChange: onChangeEndDate },
	} = useController({
		name: 'end_date',
		control: formMethods.control,
	});

	const {
		field: { value: isPublic, onChange: onChangePublic },
	} = useController({
		name: 'public',
		control: formMethods.control,
	});

	const {
		field: {
			value: opportunityStatement,
			onChange: onChangeOpportunityStatement,
			onBlur: onBlurOpportunityStatement,
		},
	} = useController({
		name: 'opportunity_statement',
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
							className='w-max!'
							checked={isPublic}
							onChange={() => {
								onChangePublic(!isPublic);
								handleSubmit();
							}}
						/>
						<div className='col-span-1 md:col-span-2'>
							<OpportunityStatementEditor
								key={selectedProject.id}
								initialValue={opportunityStatement}
								onChange={onChangeOpportunityStatement}
								onBlur={() => {
									onBlurOpportunityStatement();
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
