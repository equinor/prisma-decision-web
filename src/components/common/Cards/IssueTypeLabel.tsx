import { IssueType, issueTypes } from '../../../validators';
import { issueTypeTones } from '../../../utils/issueTypeTones';
import { IssueTypeIcon } from '../IssueTypeIcon';
import { CardLabelMenu } from './CardLabel';

export const IssueTypeLabel = ({
	type,
	onChange,
}: {
	type: IssueType;
	onChange?: (type: IssueType) => void;
}) => (
	<CardLabelMenu
		title='ISSUE TYPE'
		label={`Issue type: ${type}`}
		value={type}
		options={issueTypes}
		onChange={onChange}
		tone={issueTypeTones[type]}
		className='text-(--eds-color-text-neutral-subtle)!'
	>
		<IssueTypeIcon type={type} />
		{type}
	</CardLabelMenu>
);

export const DecisionLabel = () => <IssueTypeLabel type='Decision' />;
export const UnassignedLabel = () => <IssueTypeLabel type='Unassigned' />;
export const UncertaintyLabel = () => <IssueTypeLabel type='Uncertainty' />;
export const FactLabel = () => <IssueTypeLabel type='Fact' />;
export const UtilityLabel = () => <IssueTypeLabel type='Utility' />;
