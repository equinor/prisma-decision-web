import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { convertSolutionTreeToNodesAndEdges } from '../../../utils/convertSolutionTreeToNodesAndEdges';
import { getDecisionTreeLayout } from '../../../utils/getDecisionTreeLayout';
import { useGetSolutionTree } from '../../../hooks/api/useGetSolutionTree';

export const useSolutionTree = (enabledGetSolutionTree?: boolean) => {
	const project = useSelectedProject();
	const { data: decisionTree } = useGetSolutionTree(project?.id, enabledGetSolutionTree);
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
	};
};

export const testAtom = atom(new Set<string>());
