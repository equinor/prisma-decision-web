import { CreateIssues } from '../CreateIssueForm';
import { DecisionList } from './DecisionList';
import { FactList } from './FactList';
import { UnassignedList } from './UnassignedList';
import { UncertaintyList } from './UncertaintyList';
import { ValueList } from './ValueList';

export const ListView = () => {
	return (
		<>
			<CreateIssues />
			<UnassignedList />
			<DecisionList />
			<UncertaintyList />
			<ValueList />
			<FactList />
		</>
	);
};
