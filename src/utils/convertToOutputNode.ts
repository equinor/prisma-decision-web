import { Node } from '@xyflow/react';
import { EndNodeIssue } from '../hooks/api/useGetDecisionTree';
import {
	DecisionTreeIncomingState,
	DecisionTreeOutputNodeData,
} from '../components/common/DecisionTree/types';

export const convertToOutputNode = (
	issue: EndNodeIssue,
	id: string,
	statePath: string[] = [],
	incomingState?: DecisionTreeIncomingState,
): Node<DecisionTreeOutputNodeData> => {
	return {
		id,
		type: 'outputNode',
		height: 105,
		width: 360,
		position: {
			x: 0,
			y: 0,
		},
		data: {
			statePath,
			value: issue.value,
			cumulativeProbability: issue.cumulative_probability,
			incomingState,
		},
	};
};
