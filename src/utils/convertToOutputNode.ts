import { Node } from '@xyflow/react';
import { EndNodeIssue } from '../hooks/api/useGetDecisionTree';

export const convertToOutputNode = (
	issue: EndNodeIssue,
	id: string,
	statePath: string[] = [],
): Node<{ statePath: string[]; value: number; cumulativeProbability: number }> => {
	return {
		id,
		type: 'outputNode',
		height: 80,
		width: 1,
		position: {
			x: 0,
			y: 0,
		},
		data: {
			statePath,
			value: issue.value,
			cumulativeProbability: issue.cumulative_probability,
		},
	};
};
