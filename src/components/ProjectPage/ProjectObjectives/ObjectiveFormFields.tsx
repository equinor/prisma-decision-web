import { TextField, Textarea, Autocomplete } from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { useController, UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import { FormErrorMessage } from '../../common/FormErrorMessage';
import { Objective, objectiveTypes } from '../../../validators';

interface ObjectiveFormFieldsProps {
	register: UseFormRegister<Objective>;
	errors: FieldErrors<Objective>;
	control: Control<Objective>;
}

export const ObjectiveFormFields = ({ register, errors, control }: ObjectiveFormFieldsProps) => {
	const {
		field: { onChange: onChangeType, ref: typeRef, value: selectedType },
	} = useController({
		control,
		name: 'type',
	});

	return (
		<>
			<div>
				<TextField
					label='Name'
					placeholder='Enter objective name...'
					{...register('name')}
				/>
				<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
			</div>
			<div>
				<Autocomplete
					label='Objective Type'
					options={Array.from(objectiveTypes)}
					hideClearButton
					selectedOptions={selectedType ? [selectedType] : []}
					ref={typeRef}
					placeholder='Select objective type...'
					onOptionsChange={({ selectedItems }) => {
						if (selectedItems.length === 0) return;
						onChangeType(selectedItems[0]);
					}}
				/>
				<ErrorMessage as={FormErrorMessage} name='type' errors={errors} />
			</div>
			<div>
				<Textarea
					label='Description'
					placeholder='Enter objective description...'
					rows={6}
					{...register('description')}
				/>
				<ErrorMessage as={FormErrorMessage} name='description' errors={errors} />
			</div>
		</>
	);
};
