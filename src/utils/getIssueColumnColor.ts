import { IssueType } from '../validators';

export const getIssueColumnColor = (issueType: IssueType) => {
	return issueColumnColor[issueType];
};

const issueColumnColor: Record<IssueType, string> = {
	Unassigned: 'bg-blue-400/20',
	Decision: 'bg-red-400/20',
	Uncertainty: 'bg-pink-400/20',
	Fact: 'bg-cyan-400/20',
};
