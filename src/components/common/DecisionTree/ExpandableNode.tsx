import { Button, Icon } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useLocation } from 'react-router';
import { usePrefetchDecisionTree } from '../../../hooks/api/useGetDecisionTree';
import { usePrefetchSolutionTree } from '../../../hooks/api/useGetSolutionTree';
import { useExpandedTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const ExpandNode = ({
	data: { statePath = [], expandPathSegment },
}: NodeProps<
	Node<{
		issueId: string;
		statePath: string[];
		expectedValue?: number | null;
		expandPathSegment?: string;
	}>
>) => {
	const location = useLocation();
	const treeType = location.pathname.includes('solution') ? 'solution' : 'decision';
	const project = useSelectedProject();
	const { expandPath, expandedPaths } = useExpandedTreeNodes(statePath, treeType);
	const prefetchDecisionTree = usePrefetchDecisionTree();
	const prefetchSolutionTree = usePrefetchSolutionTree();
	const prefetch = treeType === 'solution' ? prefetchSolutionTree : prefetchDecisionTree;
	const nextPath = [
		...expandedPaths,
		[...statePath, ...(expandPathSegment ? [expandPathSegment] : [])],
	];
	if (!project) return null;
	return (
		<div className='nopan relative flex h-full items-center overflow-visible'>
			<Handle
				type='target'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3! opacity-0'
			/>
			<div
				className='absolute z-0 size-36 -translate-x-1/3'
				onMouseEnter={() => prefetch(project.id, nextPath)}
				onFocus={() => prefetch(project.id, nextPath)}
			/>
			<Button
				variant='outlined'
				onClick={() => expandPathSegment && expandPath(expandPathSegment)}
				className='relative z-10 size-12! border-0! outline-2!'
			>
				<Icon data={add} />
			</Button>
		</div>
	);
};
