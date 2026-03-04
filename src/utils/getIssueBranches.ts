import { Issue } from '../validators';

export const getIssueBranches = (issue: Issue) => {
	if (issue.type === 'Decision') {
		return issue.decision.options.map(option => ({
			id: option.id,
			name: option.name,
			utility: option.utility ?? 0,
			probability: 0,
		}));
	}

	if (issue.type === 'Uncertainty') {
		return issue.uncertainty.outcomes.map(outcome => ({
			id: outcome.id,
			name: outcome.name,
			utility: outcome.utility,
			probability: 0,
		}));
	}

	return [];
};
