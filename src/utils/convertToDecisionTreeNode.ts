import { Node } from '@xyflow/react';
import {
	DecisionTreeIncomingState,
	DecisionTreeNodeData,
} from '../components/common/DecisionTree/types';

export const convertToDecisionTreeNode = (
	issueId: string,
	type: 'treeNode' | 'expandNode',
	id: string,
	statePath: string[] = [],
	expectedValue?: number | null,
	expandPathSegment?: string,
	incomingState?: DecisionTreeIncomingState,
): Node<DecisionTreeNodeData> => {
	return {
		id,
		type,
		height: 105,
		width: 360,
		position: { x: 0, y: 0 },
		data: {
			issueId,
			expectedValue,
			statePath,
			expandPathSegment,
			incomingState,
		},
	};
};
