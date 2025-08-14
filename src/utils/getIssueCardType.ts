import { DecisionCard } from '../components/common/Cards/DecisionCard';
import { FactCard } from '../components/common/Cards/FactCard';
import { UnassignedCard } from '../components/common/Cards/UnassignedCard';
import { UncertaintyeCard } from '../components/common/Cards/UncertaintyeCard';
import { ValueMetricCard } from '../components/common/Cards/ValueMetricCard';
import { IssueType } from '../validators';

export const getIssueCardType = (type?: IssueType) => {
	if (!type) return UnassignedCard;
	return issueCardTypes[type];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const issueCardTypes: Record<IssueType, React.ComponentType<any>> = {
	Decision: DecisionCard,
	Uncertainty: UncertaintyeCard,
	'Value Metric': ValueMetricCard,
	Fact: FactCard,
	Unassigned: UnassignedCard,
};
