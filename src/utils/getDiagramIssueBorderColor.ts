import { IssueType } from '../validators';

export const getDiagramIssueBorderColor = (type: IssueType, selected: boolean) => {
	return selected ? diagramSelectedIssueBorderColors[type] : diagramIssueBorderColors[type];
};

const diagramIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'outline-blue-400/50 has-[:hover]:outline-blue-400',
	Decision: 'outline-red-400/50 has-[:hover]:outline-red-400',
	Uncertainty: 'outline-pink-400/50 has-[:hover]:outline-pink-400',
	Fact: 'outline-cyan-400/50 has-[:hover]:outline-cyan-400',
};

const diagramSelectedIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'outline-blue-400',
	Decision: 'outline-red-400',
	Uncertainty: 'outline-pink-400',
	Fact: 'outline-cyan-400',
};
