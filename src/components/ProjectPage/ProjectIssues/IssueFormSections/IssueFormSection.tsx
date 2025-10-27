import { Autocomplete, Textarea, TextField } from '@equinor/eds-core-react';
import { useController } from 'react-hook-form';
import { useIssueFormContext } from '../../../../hooks/useIssueForm';
import { ErrorMessage } from '@hookform/error-message';
import { issueTypes } from '../../../../validators';
import { FormErrorMessage } from '../../../common/FormErrorMessage';

export const IssueFormSection = () => {
	const { register, control } = useIssueFormContext();
	const {
		field: { onChange: onChangeType, ref: typeRef, value: selectedType },
	} = useController({
		control,
		name: 'type',
	});
	const {
		field: { onChange: onBoundaryType, ref: boundaryRef, value: selectedBoundary },
	} = useController({
		control,
		name: 'boundary',
	});
	return (
		<div className='grid w-full grid-cols-2 gap-4'>
			<div className='col-span-2'>
				<TextField
					placeholder='Enter issue name...'
					label='Issue Name'
					{...register('name')}
				/>
				<ErrorMessage as={FormErrorMessage} name='name' />
			</div>
			<div>
				<Autocomplete
					label='Issue Type'
					options={issueTypes}
					hideClearButton
					selectedOptions={[selectedType]}
					ref={typeRef}
					onOptionsChange={({ selectedItems }) => {
						if (selectedItems.length === 0) return;
						onChangeType(selectedItems[0]);
					}}
				/>
				<ErrorMessage as={FormErrorMessage} name='type' />
			</div>

			<div>
				<Autocomplete
					label='Boundary'
					hideClearButton
					options={['in', 'on', 'out']}
					selectedOptions={[selectedBoundary]}
					ref={boundaryRef}
					onOptionsChange={({ selectedItems }) => {
						if (selectedItems.length === 0) return;
						onBoundaryType(selectedItems[0]);
					}}
				/>
				<ErrorMessage as={FormErrorMessage} name='boundary' />
			</div>
			<div className='col-span-2'>
				<Textarea
					label='Description'
					placeholder='Enter description...'
					{...register('description')}
					rows={4}
				/>
				<ErrorMessage as={FormErrorMessage} name='description' />
			</div>
		</div>
	);
};
