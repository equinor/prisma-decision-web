import { useWatch } from 'react-hook-form';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { IssueForm } from '../IssueForm/IssueForm';

const decisionTypeDescriptions = {
	Policy: 'Already decided or taken as given. Not decided in this project.',
	Focus: 'The main choice to be made in this project.',
	Tactical: 'Supporting choices needed to implement the focus decision.',
};

export const CreateDecisionForm = () => {
	const { control } = useIssueFormContext();
	const decisionType = useWatch({ control, name: 'decision.type' });
	return (
		<>
			<h3 className='text-lg font-semibold'>Decision Details</h3>
			<IssueForm.DecisionType description={decisionTypeDescriptions[decisionType]} />
			<IssueForm.Options />
		</>
	);
};
