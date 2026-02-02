import { Node } from '@xyflow/react';
import { EndNodeIssue } from '../hooks/api/useGetDecisionTree';

export const convertToOutputNode = (issue: EndNodeIssue, id: string, path: Set<string>): Node => {
	return {
		id,
		type: 'outputNode',
		height: 150,
		width: 1,
		position: {
			x: 0,
			y: 0,
		},
		data: {
			path,
			value: issue.value,
		},
	};
};
