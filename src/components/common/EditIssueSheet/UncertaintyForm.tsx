import { Issue } from '../../../validators';
import { IssueForm } from '../IssueForm/IssueForm';

export const UncertaintyForm = ({ issue }: { issue: Issue }) => (
	<IssueForm>
		<IssueForm.Name />
		<IssueForm.Description rows={3} className='[&_textarea]:pb-0!' />
		<h3 className='mt-2 text-lg leading-6 font-normal'>Uncertainty Details</h3>
		<IssueForm.IsKey />
		<IssueForm.TypeWarning issue={issue} />
		<IssueForm.Outcomes issue={issue} />
	</IssueForm>
);
