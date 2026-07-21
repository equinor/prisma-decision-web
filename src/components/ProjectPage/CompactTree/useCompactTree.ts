import { useGetPartialOrder } from '../../../hooks/api/useGetPartialOrder';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { buildEdgesForNodeBranches } from '../../../utils/buildEdgesForNodeBranches';
import { convertToCompactTreeNode } from '../../../utils/convertToCompactTreeNode';
import { useSelectedProject } from '../ProjectContext';

export const useCompactTree = () => {
	const project = useSelectedProject();
	const issues = useSelectedProjectIssues();
	const { data: partialOrder = [], isError } = useGetPartialOrder(project.id);
	const partialOrderIssues = partialOrder
		.map(id => issues.find(issue => issue.id === id))
		.filter(x => x !== undefined);
	const partialOrderNodes = convertToCompactTreeNode(partialOrderIssues);
	const { nodes: anchorNodes, edges } = buildEdgesForNodeBranches(partialOrderNodes);

	return {
		nodes: [...partialOrderNodes, ...anchorNodes],
		edges,
		isError,
	};
};
