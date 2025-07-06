import { Type } from '@dnd-kit/abstract';
import { DecisionCard } from '../components/common/DecisionCard';
import { FactCard } from '../components/common/FactCard';
import { UnassignedCard } from '../components/common/UnassignedCard';
import { UncertaintieCard } from '../components/common/UncertaintieCard';
import { ValueCard } from '../components/common/ValueCard';

export const getCardType = (type?: Type) => {
	if (!type) return UnassignedCard;
	switch (type) {
		case 'Decision':
			return DecisionCard;
		case 'Uncertainty':
			return UncertaintieCard;
		case 'Value':
			return ValueCard;
		case 'Fact':
			return FactCard;
		default:
			return UnassignedCard;
	}
};
