import { Icon } from '@equinor/eds-core-react/next';
import { arrow_drop_down } from '@equinor/eds-icons';
import { DecisionType, decisionTypes } from '../../../validators';
import { CardLabelMenu } from './CardLabel';

export const DecisionTypeLabel = ({
	type,
	onChange,
}: {
	type: DecisionType;
	onChange?: (type: DecisionType) => void;
}) => (
	<CardLabelMenu
		title='DECISION TYPE'
		label={`Decision type: ${type}`}
		value={type}
		options={decisionTypes}
		onChange={onChange}
	>
		{type}
		{!onChange && <Icon data={arrow_drop_down} size='md' />}
	</CardLabelMenu>
);
