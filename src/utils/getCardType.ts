import { DecisionCard } from '../components/common/Cards/DecisionCard';
import { FactCard } from '../components/common/Cards/FactCard';
import { UnassignedCard } from '../components/common/Cards/UnassignedCard';
import { UncertaintyeCard } from '../components/common/Cards/UncertaintyeCard';
import { ValueMetricCard } from '../components/common/Cards/ValueMetricCard';
import { IssueType } from '../validators';

export const getCardType = (type?: IssueType) => {
	if (!type) return UnassignedCard;
	switch (type) {
		case 'Decision':
			return DecisionCard;
		case 'Uncertainty':
			return UncertaintyeCard;
		case 'Value Metric':
			return ValueMetricCard;
		case 'Fact':
			return FactCard;
		default:
			return UnassignedCard;
	}
};
