import { useMemo } from 'react';
import { convertDecisionTreeToNodesAndEdges } from '../utils/convertDecisionTreeToNodesAndEdges';
import { getDecisionTreeLayout } from '../utils/getDecisionTreeLayout';
import { DecisionTree } from './api/useGetDecisionTree';
import { useSelectedDecisionTreePath } from './useSelectedDecisionTreePath';

export const useDecisionTree = (
	decisionTree: DecisionTree | undefined,
	treeType: 'decision' | 'solution',
) => {
	const { selectedPath } = useSelectedDecisionTreePath(treeType);
	const { nodes, edges } = useMemo(() => {
		if (!decisionTree) {
			return { nodes: [], edges: [] };
		}
		const { nodes, edges } = convertDecisionTreeToNodesAndEdges({
			tree: decisionTree,
			selectedPath,
		});
		return getDecisionTreeLayout(nodes, edges);
	}, [decisionTree, selectedPath]);

	return {
		nodes,
		edges,
	};
};
