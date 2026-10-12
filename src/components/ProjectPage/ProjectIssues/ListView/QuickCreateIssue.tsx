import { Button, TextField } from '@equinor/eds-core-react/next';
import { useIssueForm } from '../../../../hooks/useIssueForm';
import { issueTypes } from '../../../../validators';
import { IssueTypeIcon } from '../../../common/IssueTypeIcon';
import { SegmentedSelector } from '../../../common/SegmentedSelector';
import { useFormState, useWatch } from 'react-hook-form';

export const QuickCreateIssue = ({ onCreated }: { onCreated: (id: string) => void }) => {
	const {
		register,
		onSubmit,
		setFocus,
		control,
		isPending,
		formState: { errors, isSubmitting },
	} = useIssueForm({
		onSuccess: id => {
			onCreated(id);
			setFocus('name');
		},
	});

	const pending = isSubmitting || isPending;
	const { isValid } = useFormState({ control });
	const [type, boundary] = useWatch({ control, name: ['type', 'boundary'] });

	return (
		<form aria-label='Quick-create issue' onSubmit={onSubmit} className='w-full'>
			<fieldset
				disabled={pending}
				className='grid w-full items-start gap-3 [@media(min-width:1130px)]:grid-cols-[minmax(180px,1fr)_minmax(240px,1.4fr)_180px_152px_auto]'
			>
				<TextField
					aria-label='Issue name'
					placeholder='Issue name (required)'
					{...register('name')}
					invalid={!!errors.name}
					helperMessage={errors.name?.message}
				/>
				<TextField
					aria-label='Description'
					placeholder='Description (required)'
					{...register('description')}
					invalid={!!errors.description}
					helperMessage={errors.description?.message}
				/>
				<SegmentedSelector
					label='Issue type'
					{...register('type')}
					value={type}
					compact
					options={issueTypes.map(value => ({
						value,
						tooltip: `Type: ${value}`,
						label: (
							<>
								<IssueTypeIcon type={value} />
								<span className='sr-only'>{value}</span>
							</>
						),
					}))}
				/>
				<SegmentedSelector
					label='Boundary'
					{...register('boundary')}
					value={boundary}
					compact
					options={[
						{ value: 'in', label: 'In' },
						{ value: 'on', label: 'On' },
						{ value: 'out', label: 'Out' },
					]}
				/>
				<Button type='submit' disabled={!isValid || pending} aria-busy={pending}>
					Create issue
				</Button>
			</fieldset>
		</form>
	);
};
