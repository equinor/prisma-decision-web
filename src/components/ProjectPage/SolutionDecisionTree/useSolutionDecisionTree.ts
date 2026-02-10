import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useGetSolutionDecisionTree } from '../../../hooks/api/useGetSolutionDecisionTree';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { convertSolutionTreeToNodesAndEdges } from '../../../utils/convertSolutionTreeToNodesAndEdges';
import { getDecisionTreeLayout } from '../../../utils/getDecisionTreeLayout';

export const useSolutionDecisionTree = () => {
	const project = useSelectedProject();
	const { data: decisionTree, isError } = useGetSolutionDecisionTree(project?.id);
	const selected = useAtomValue(testAtom);

	const { nodes, edges } = useMemo(() => {
		if (!decisionTree) {
			return { nodes: [], edges: [] };
		}
		const { nodes, edges } = convertSolutionTreeToNodesAndEdges({
			tree: decisionTree,
			selected,
		});
		return getDecisionTreeLayout(nodes, edges);
	}, [decisionTree, selected]);

	return {
		nodes,
		edges,
		isError,
	};
};

export const testAtom = atom(new Set<string>());
