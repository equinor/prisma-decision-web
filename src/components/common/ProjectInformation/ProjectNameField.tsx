import { TextField } from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Project } from '../../../validators';
import { FormErrorMessage } from '../FormErrorMessage';

type ProjectNameFieldProps = {
	register: UseFormRegister<Project>;
	errors: FieldErrors<Project>;
	onBlur?: () => void;
	className?: string;
};

export const ProjectNameField = ({
	register,
	errors,
	onBlur,
	className,
}: ProjectNameFieldProps) => (
	<div className={className}>
		<TextField
			label='Project Name'
			placeholder='Enter project name...'
			{...register('name')}
			onBlur={onBlur}
		/>
		<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
	</div>
);
