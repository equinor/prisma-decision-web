import { IssueType } from '../validators';

export const getDiagramIssueBorderColor = (type: IssueType, selected: boolean) => {
	return selected ? diagramSelectedIssueBorderColors[type] : diagramIssueBorderColors[type];
};

const diagramIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'outline-red-300/40',
	Decision: 'outline-yellow-300/40',
	Uncertainty: 'outline-green-300/40',
	Fact: 'outline-gray-300/40',
};

const diagramSelectedIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'outline-red-300',
	Decision: 'outline-yellow-300',
	Uncertainty: 'outline-green-300',
	Fact: 'outline-gray-300',
};
