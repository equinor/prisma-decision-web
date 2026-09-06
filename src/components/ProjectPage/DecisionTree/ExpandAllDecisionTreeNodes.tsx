import { Button } from '@equinor/eds-core-react';
import { Node } from '@xyflow/react';
import { useSetAtom } from 'jotai';
import { expandedDecisionTreeNodes, isSameDecisionPath } from '../../../hooks/useExpandedTreeNodes';
import { useSelectedProject } from '../ProjectContext';

type ExpandNodeData = {
	statePath?: string[];
	expandPathSegment?: string;
};

export const ExpandAllDecisionTreeNodes = ({ nodes }: { nodes: Node[] }) => {
	const project = useSelectedProject();
	const setExpandedPaths = useSetAtom(
		expandedDecisionTreeNodes({ projectId: project.id, treeType: 'decision' }),
	);

	const expandablePaths = nodes.flatMap(node => {
		if (node.type !== 'expandNode') return [];

		const { statePath, expandPathSegment } = node.data as ExpandNodeData;
		if (!statePath || !expandPathSegment) return [];

		return [[...statePath, expandPathSegment]];
	});

	const expandAll = () => {
		setExpandedPaths(currentPaths => [
			...currentPaths,
			...expandablePaths.filter(
				path => !currentPaths.some(currentPath => isSameDecisionPath(currentPath, path)),
			),
		]);
	};

	return (
		<Button variant='outlined' onClick={expandAll} disabled={expandablePaths.length === 0}>
			Expand All
		</Button>
	);
};
