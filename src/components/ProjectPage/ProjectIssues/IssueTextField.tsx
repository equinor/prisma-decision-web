import { useFormState } from 'react-hook-form';
import { useIssueForm } from '../../../hooks/useIssueForm';
import { Issue } from '../../../validators';
import { showSuccessToast } from '../../ShowToast';
import { InlineTextField } from '../../common/InlineTextField';

export const IssueTextField = ({
	issue,
	field,
	className,
	showHint,
	variant = 'table',
}: {
	issue: Issue;
	field: 'name' | 'description';
	className?: string;
	showHint?: boolean;
	variant?: 'card' | 'table';
}) => {
	const { register, control, reset, getFieldState, getValues, onSubmit } = useIssueForm({
		issue,
		optimistic: true,
		onSuccess: () =>
			showSuccessToast(field === 'name' ? 'Name updated' : 'Description updated'),
	});
	const { errors } = useFormState({ control });
	const label = field === 'name' ? 'Issue name' : 'Issue description';

	return (
		<InlineTextField
			value={issue[field]}
			label={label}
			inputProps={register(field)}
			error={errors[field]?.message}
			multiline={field === 'description'}
			className={className}
			showHint={showHint}
			variant={variant}
			onEdit={() => reset(issue)}
			onSave={async () => {
				if (getValues(field) !== issue[field]) await onSubmit();
				return !getFieldState(field).invalid;
			}}
		/>
	);
};
