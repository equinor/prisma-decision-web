import { DecisionList } from './DecisionList';
import { FactList } from './FactList';
import { UnassignedList } from './UnassignedList';
import { UncertaintyList } from './UncertaintyList';

export const ListView = () => {
	return (
		<>
			<UnassignedList />
			<DecisionList />
			<UncertaintyList />
			<FactList />
		</>
	);
};
