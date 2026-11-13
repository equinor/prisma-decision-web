import { TextField } from '@equinor/eds-core-react/next';
import { ErrorMessage } from '@hookform/error-message';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useRef } from 'react';
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
	const inputRef = useRef<HTMLInputElement>(null);

	useHotkey('Enter', () => inputRef.current?.blur(), {
		target: inputRef,
		enabled: !!onBlur,
		ignoreInputs: false,
	});

	return (
		<div className='w-full'>
			<TextField
				label='Project Name'
				placeholder='Enter project name...'
				{...field}
				ref={element => {
					field.ref(element);
					inputRef.current = element;
				}}
				onBlur={() => {
					field.onBlur();
					onBlur?.();
				}}
			/>
			<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
		</div>
	);
};
