import {
	DecisionLabel,
	FactLabel,
	UnassignedLabel,
	UncertaintyLabel,
	UtilityLabel,
} from '../components/common/Cards/IssueLabel';
import { IssueType } from '../validators';

export const getIssueLabel = (type: IssueType) => {
	switch (type) {
		case 'Decision':
			return DecisionLabel;
		case 'Uncertainty':
			return UncertaintyLabel;
		case 'Fact':
			return FactLabel;
		case 'Utility':
			return UtilityLabel;
		default:
			return UnassignedLabel;
	}
};
