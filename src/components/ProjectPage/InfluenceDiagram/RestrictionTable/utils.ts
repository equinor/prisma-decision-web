import { sortByCreatedAt } from '../../../../utils/sortByCreatedAt';
import { Issue } from '../../../../validators';

export const getIssueRestrictionStates = (issue: Issue) => {
	if (issue.type === 'Decision') {
		return sortByCreatedAt(issue.decision.options).map(option => ({
			id: option.id,
			name: option.name,
			isUncertainty: false,
		}));
	}

	if (issue.type === 'Uncertainty') {
		return sortByCreatedAt(issue.uncertainty.outcomes).map(outcome => ({
			id: outcome.id,
			name: outcome.name,
			isUncertainty: true,
		}));
	}

	return [];
};
