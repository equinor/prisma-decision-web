import { IssueType } from '../validators';

export const getIssueColumnColor = (issueType: IssueType) => {
	return issueColumnColor[issueType];
};

const issueColumnColor: Record<IssueType, string> = {
	Unassigned: 'bg-red-300/25',
	Decision: 'bg-yellow-300/25',
	Uncertainty: 'bg-green-300/25',
	Fact: 'bg-gray-300/25',
	Utility: 'bg-blue-300/25',
};
