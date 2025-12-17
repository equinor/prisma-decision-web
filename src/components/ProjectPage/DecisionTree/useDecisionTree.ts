import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useGetDecisionTree } from '../../../hooks/api/useGetDecisionTree';
import { expandedDecisionTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { convertDecisionTreeToNodesAndEdges } from '../../../utils/convertDecisionTreeToNodesAndEdges';
import { getDecisionTreeLayout } from '../../../utils/getDecisionTreeLayout';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const useDecisionTree = () => {
	const project = useSelectedProject();
	const { data: decisionTree } = useGetDecisionTree(project?.id);
	const expanded = useAtomValue(expandedDecisionTreeNodes);
	const selected = useAtomValue(testAtom);

	const { nodes, edges } = useMemo(() => {
		if (!decisionTree) {
			return { nodes: [], edges: [] };
		}
		const { nodes, edges } = convertDecisionTreeToNodesAndEdges(
			decisionTree,
			expanded,
			selected,
		);
		return getDecisionTreeLayout(nodes, edges);
	}, [decisionTree, expanded, selected]);

	return {
		nodes,
		edges,
	};
};

export const testAtom = atom(new Set<string>());
