import { DecisionCard } from '../components/common/Cards/DecisionCard';
import { FactCard } from '../components/common/Cards/FactCard';
import { UnassignedCard } from '../components/common/Cards/UnassignedCard';
import { UncertaintyCard } from '../components/common/Cards/UncertaintyCard';
import { UtilityCard } from '../components/common/Cards/UtilityCard';
import { IssueType } from '../validators';

export const getIssueCardType = (type?: IssueType) => {
	if (!type) return UnassignedCard;
	return issueCardTypes[type];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const issueCardTypes: Record<IssueType, React.ComponentType<any>> = {
	Decision: DecisionCard,
	Uncertainty: UncertaintyCard,
	Fact: FactCard,
	Unassigned: UnassignedCard,
	Utility: UtilityCard,
};
