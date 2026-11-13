import { Issue } from '../../../validators';
import { IssueForm } from '../IssueForm/IssueForm';

export const DecisionForm = ({ issue }: { issue: Issue }) => (
	<IssueForm>
		<IssueForm.Name />
		<IssueForm.Description rows={3} className='[&_textarea]:pb-0!' />
		<h3 className='mt-2 text-lg leading-6 font-normal'>Decision Details</h3>
		<IssueForm.DecisionType />
		<IssueForm.TypeWarning issue={issue} />
		<IssueForm.Options issue={issue} />
	</IssueForm>
);
