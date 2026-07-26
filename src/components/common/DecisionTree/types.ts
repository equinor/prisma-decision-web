export type DecisionTreeIncomingState = {
	stateId: string;
	label: string;
	utility: number;
	probability?: number;
};

export type DecisionTreeNodeData = {
	issueId: string;
	statePath?: string[];
	expectedValue?: number | null;
	expandPathSegment?: string;
	incomingState?: DecisionTreeIncomingState;
};

export type DecisionTreeOutputNodeData = {
	statePath: string[];
	value: number;
	cumulativeProbability: number;
	incomingState?: DecisionTreeIncomingState;
};
