import { TextArea, TextField } from '@equinor/eds-core-react/next';
import { ErrorMessage } from '@hookform/error-message';
import { useController, UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import { FormErrorMessage } from '../../common/FormErrorMessage';
import { Objective, objectiveTypes } from '../../../validators';
import { SegmentedSelector } from '../../common/SegmentedSelector';

interface ObjectiveFormFieldsProps {
	register: UseFormRegister<Objective>;
	errors: FieldErrors<Objective>;
	control: Control<Objective>;
}

export const ObjectiveFormFields = ({ register, errors, control }: ObjectiveFormFieldsProps) => {
	const {
		field: { name: typeName, onBlur: onBlurType, onChange: onChangeType, ref: typeRef, value },
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
				<SegmentedSelector
					label='Objective Type'
					name={typeName}
					value={value}
					options={objectiveTypes.map(type => ({ value: type, label: type }))}
					ref={typeRef}
					onBlur={onBlurType}
					onChange={onChangeType}
				/>
				<ErrorMessage as={FormErrorMessage} name='type' errors={errors} />
			</div>
			<div>
				<TextArea
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
