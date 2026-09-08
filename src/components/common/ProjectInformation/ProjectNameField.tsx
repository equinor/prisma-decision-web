import { TextField } from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { useController, useFormContext } from 'react-hook-form';
import { Project } from '../../../validators';
import { FormErrorMessage } from '../FormErrorMessage';

type ProjectNameFieldProps = {
	onBlur?: () => void;
};

export const ProjectNameField = ({ onBlur }: ProjectNameFieldProps) => {
	const {
		control,
		formState: { errors },
	} = useFormContext<Project>();
	const { field } = useController({ name: 'name', control });

	return (
		<div className='w-full'>
			<TextField
				label='Project Name'
				placeholder='Enter project name...'
				{...field}
				onBlur={() => {
					field.onBlur();
					onBlur?.();
				}}
			/>
			<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
		</div>
	);
};
