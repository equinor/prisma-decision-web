import { IssueType } from '../validators';

export const getDiagramIssueBorderColor = (type: IssueType, selected: boolean) => {
	return selected ? diagramSelectedIssueBorderColors[type] : diagramIssueBorderColors[type];
};

const diagramIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'border-red-300/40',
	Decision: 'border-[#FF9200]/40',
	Uncertainty: 'border-[#40D38F]/40',
	Fact: 'border-gray-300/40',
};

const diagramSelectedIssueBorderColors: Record<IssueType, string> = {
	Unassigned: 'border-red-300',
	Decision: 'border-[#FF9200]',
	Uncertainty: 'border-[#40D38F]',
	Fact: 'border-gray-300',
};
