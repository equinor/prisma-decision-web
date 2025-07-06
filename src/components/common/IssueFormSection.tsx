import { Autocomplete, TextField } from '@equinor/eds-core-react';
import { useController } from 'react-hook-form';
import { useIssueFormContext } from '../../hooks/useIssueForm';
import { issueTypes } from '../../validators';

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
		<div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2'>
			<TextField placeholder='Enter issue name...' label='Issue Name' {...register('name')} />
			<TextField placeholder='Enter label...' label='Label' />
			<Autocomplete
				label='Category'
				options={issueTypes}
				hideClearButton
				selectedOptions={[selectedType]}
				ref={typeRef}
				onOptionsChange={({ selectedItems }) => {
					if (selectedItems.length === 0) return;
					onChangeType(selectedItems[0]);
				}}
			/>
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
			<TextField
				label='Description'
				placeholder='Enter description...'
				className='md:col-span-2'
				{...register('description')}
				multiline
				rows={4}
			/>
		</div>
	);
};
