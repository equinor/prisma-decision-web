import { Issue } from '../../../../validators';

export const getIssueRestrictionStates = (issue: Issue) => {
	if (issue.type === 'Decision') {
		return issue.decision.options.map(option => ({
			id: option.id,
			name: option.name,
			isUncertainty: false,
		}));
	}

	if (issue.type === 'Uncertainty') {
		return issue.uncertainty.outcomes.map(outcome => ({
			id: outcome.id,
			name: outcome.name,
			isUncertainty: true,
		}));
	}

	return [];
};
