import { Type } from '@dnd-kit/abstract';
import { DecisionCard } from '../components/ProjectPage/TableView/DecisionCard';
import { FactCard } from '../components/ProjectPage/TableView/FactCard';
import { UnassignedCard } from '../components/ProjectPage/TableView/UnassignedCard';
import { UncertaintieCard } from '../components/ProjectPage/TableView/UncertaintieCard';
import { ValueCard } from '../components/ProjectPage/TableView/ValueCard';

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
