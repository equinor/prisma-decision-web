import { IssueForm } from '../IssueForm/IssueForm';

export const UnassignedForm = () => (
	<IssueForm>
		<IssueForm.Name />
		<IssueForm.Description rows={3} className='[&_textarea]:pb-0!' />
	</IssueForm>
);
