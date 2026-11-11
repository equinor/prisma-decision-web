import { IssueForm } from '../IssueForm/IssueForm';

export const CreateUncertaintyForm = () => (
	<>
		<h3 className='text-lg font-semibold'>Uncertainty Details</h3>
		<IssueForm.IsKey label='Is Key' />
		<IssueForm.Outcomes />
	</>
);
