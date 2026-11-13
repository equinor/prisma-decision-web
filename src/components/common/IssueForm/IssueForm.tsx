import { Switch, TextArea, TextField } from '@equinor/eds-core-react/next';
import { ReactNode } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { boundaryLabels, decisionTypes, issueTypes } from '../../../validators';
import { SegmentedSelector } from '../SegmentedSelector';
import { IssueTypeIcon } from '../IssueTypeIcon';
import { IssueBoundaryWarning, IssueTypeWarning } from './IssueExclusionWarning';
import { OptionFields } from './OptionFields';
import { OutcomeFields } from './OutcomeFields';

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

export function IssueForm({ children }: { children: ReactNode }) {
	return <div className='flex w-full flex-col gap-4'>{children}</div>;
}

const IssueName = () => {
	const {
		register,
		formState: { errors },
	} = useIssueFormContext();
	return (
		<TextField
			placeholder='Enter issue name...'
			label='Issue name'
			{...register('name')}
			invalid={!!errors.name}
			helperMessage={errors.name?.message}
		/>
	);
};

const IssueDescription = ({ rows = 4, className }: { rows?: number; className?: string }) => {
	const {
		register,
		formState: { errors },
	} = useIssueFormContext();
	return (
		<TextArea
			label='Description'
			className={className}
			placeholder='Enter description...'
			{...register('description')}
			onKeyDown={event => {
				if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
					event.preventDefault();
					event.currentTarget.form?.requestSubmit();
				}
			}}
			rows={rows}
			invalid={!!errors.description}
			helperMessage={errors.description?.message}
		/>
	);
};

const IssueType = () => {
	const { register, control } = useIssueFormContext();
	const type = useWatch({ control, name: 'type' });
	return (
		<SegmentedSelector
			label='Issue type'
			{...register('type')}
			value={type}
			options={typeOptions}
			description={issueTypeDescriptions[type]}
		/>
	);
};

const boundaryOptions = Object.entries(boundaryLabels).map(([value, label]) => ({
	value,
	label,
}));

const IssueBoundary = () => {
	const { register, control } = useIssueFormContext();
	const boundary = useWatch({ control, name: 'boundary' });
	return (
		<SegmentedSelector
			label='Boundary'
			{...register('boundary')}
			value={boundary}
			options={boundaryOptions}
			description='Whether the issue is inside, on, or outside the scope of this decision.'
		/>
	);
};

const IssueDecisionType = ({ description }: { description?: string }) => {
	const { control, register } = useIssueFormContext();
	const decisionType = useWatch({ control, name: 'decision.type' });
	return (
		<SegmentedSelector
			label='Decision type'
			{...register('decision.type')}
			value={decisionType}
			options={decisionTypes.map(value => ({ value, label: value }))}
			description={description}
		/>
	);
};

const IssueIsKey = ({ label = 'Is key' }: { label?: string }) => {
	const { control } = useIssueFormContext();
	const { field } = useController({ control, name: 'uncertainty.is_key' });
	return (
		<div>
			<Switch
				label={label}
				name={field.name}
				ref={field.ref}
				onBlur={field.onBlur}
				checked={field.value}
				onChange={event => field.onChange(event.target.checked)}
			/>
		</div>
	);
};

IssueForm.Name = IssueName;
IssueForm.Description = IssueDescription;
IssueForm.Type = IssueType;
IssueForm.Boundary = IssueBoundary;
IssueForm.DecisionType = IssueDecisionType;
IssueForm.IsKey = IssueIsKey;
IssueForm.Options = OptionFields;
IssueForm.Outcomes = OutcomeFields;
IssueForm.BoundaryWarning = IssueBoundaryWarning;
IssueForm.TypeWarning = IssueTypeWarning;
