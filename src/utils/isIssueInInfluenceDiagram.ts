import { Issue } from '../validators';

export const isIssueInInfluenceDiagram = (issue: Issue) => {
	if (issue.boundary === 'out') return false;
	if (issue.type === 'Decision') return issue.decision.type === 'Focus';
	if (issue.type === 'Uncertainty') return issue.uncertainty.is_key;
	return issue.type === 'Utility';
};
