import { IssueType } from '../validators';

export const getDiagramIssueBorderColor = (type: IssueType, selected: boolean) => {
	return selected ? diagramSelectedIssueBorderColors[type] : diagramIssueBorderColors[type];
};

const diagramIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'outline-red-300/40 has-[:hover]:outline-red-300',
	Decision: 'outline-yellow-300/40 has-[:hover]:outline-yellow-300',
	Uncertainty: 'outline-green-300/40 has-[:hover]:outline-green-300',
	Fact: 'outline-gray-300/40 has-[:hover]:outline-gray-300',
};

const diagramSelectedIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'outline-red-300',
	Decision: 'outline-yellow-300',
	Uncertainty: 'outline-green-300',
	Fact: 'outline-gray-300',
};
