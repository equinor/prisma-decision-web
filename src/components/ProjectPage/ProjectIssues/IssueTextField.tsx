import { useFormState } from 'react-hook-form';
import { useIssueForm } from '../../../hooks/useIssueForm';
import { Issue } from '../../../validators';
import { showSuccessToast } from '../../ShowToast';
import { InlineTextEditor } from '../../common/InlineTextEditor';

export const IssueTextField = ({
	issue,
	field,
	className,
	showHint,
	onEditingChange,
}: {
	issue: Issue;
	field: 'name' | 'description';
	className?: string;
	showHint?: boolean;
	onEditingChange?: (editing: boolean) => void;
}) => {
	const { register, control, reset, trigger, getValues, onSubmit } = useIssueForm({
		issue,
		optimistic: true,
		onSuccess: () =>
			showSuccessToast(field === 'name' ? 'Name updated' : 'Description updated'),
	});
	const { errors } = useFormState({ control });
	return (
		<InlineTextEditor
			value={issue[field]}
			inputProps={register(field)}
			error={errors[field]?.message}
			onStartEditing={() => reset(issue)}
			label={field === 'name' ? 'Issue name' : 'Issue description'}
			className={className}
			multiline={field === 'description'}
			showHint={showHint}
			onEditingChange={onEditingChange}
			onSave={async () => {
				if (!(await trigger(field))) return false;
				if (getValues(field) !== issue[field]) await onSubmit();
				return true;
			}}
		/>
	);
};