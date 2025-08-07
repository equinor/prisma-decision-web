import { DecisionList } from './DecisionList';
import { FactList } from './FactList';
import { UnassignedList } from './UnassignedList';
import { UncertaintyList } from './UncertaintyList';
import { ValueMetricList } from './ValueMetricList';

export const ListView = () => {
	return (
		<>
			<UnassignedList />
			<DecisionList />
			<UncertaintyList />
			<ValueMetricList />
			<FactList />
		</>
	);
};
