import { TextArea, TextField } from '@equinor/eds-core-react/next';
import { useWatch } from 'react-hook-form';
import { useIssueFormContext } from '../../../../hooks/useIssueForm';
import { issueTypes } from '../../../../validators';
import { SegmentedSelector } from '../../../common/SegmentedSelector';
import { IssueTypeIcon } from '../../../common/IssueTypeIcon';

const issueTypeDescriptions = {
	Unassigned: 'Not classified yet. You can set the type later.',
	Decision: 'A choice the decision makers control.',
	Uncertainty: 'Something that affects the outcome but cannot be controlled.',
	Fact: 'A given that is taken as known.',
	Utility: 'A value used to measure how good an outcome is.',
};

const typeOptions = issueTypes.map(value => ({
	value,
	label: (
		<>
			<IssueTypeIcon type={value} />
			{value}
		</>
	),
}));

export const IssueFormSection = () => {
	const {
		register,
		control,
		formState: { errors },
	} = useIssueFormContext();
	const type = useWatch({
		control,
		name: 'type',
	});
	return (
		<div className='flex w-full flex-col gap-4'>
			<TextField
				placeholder='Enter issue name...'
				label='Issue name'
				{...register('name')}
				invalid={!!errors.name}
				helperMessage={errors.name?.message}
			/>
			<TextArea
				label='Description'
				placeholder='Enter description...'
				{...register('description')}
				onKeyDown={event => {
					if (
						event.key === 'Enter' &&
						!event.shiftKey &&
						!event.nativeEvent.isComposing
					) {
						event.preventDefault();
						event.currentTarget.form?.requestSubmit();
					}
				}}
				rows={4}
				invalid={!!errors.description}
				helperMessage={errors.description?.message}
			/>
			<SegmentedSelector
				label='Issue type'
				{...register('type')}
				options={typeOptions}
				description={issueTypeDescriptions[type]}
			/>
			<SegmentedSelector
				label='Boundary'
				{...register('boundary')}
				options={[
					{ value: 'in', label: 'In' },
					{ value: 'on', label: 'On' },
					{ value: 'out', label: 'Out' },
				]}
				description='Whether the issue is inside, on, or outside the scope of this decision.'
			/>
		</div>
	);
};
