import { Node } from '@xyflow/react';

export const convertToDecisionTreeNode = (
	issueId: string,
	type: 'treeNode' | 'expandNode' | 'prunedNode',
	id: string,
	statePath: string[] = [],
	expectedValue?: number | null,
	expandPathSegment?: string,
): Node<{
	issueId: string;
	statePath: string[];
	expectedValue?: number | null;
	expandPathSegment?: string;
}> => {
	return {
		id,
		type,
		height: 80,
		width: type === 'treeNode' ? 250 : 1,
		position: { x: 0, y: 0 },
		data: {
			issueId,
			expectedValue,
			statePath,
			expandPathSegment,
		},
	};
};
