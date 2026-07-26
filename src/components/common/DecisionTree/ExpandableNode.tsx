import { Button, Icon } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useLocation } from 'react-router';
import { usePrefetchDecisionTree } from '../../../hooks/api/useGetDecisionTree';
import { usePrefetchSolutionTree } from '../../../hooks/api/useGetSolutionTree';
import { useExpandedTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { DecisionTreeNodeData } from './types';
import { IncomingStateDetails } from './IncomingStateDetails';

export const ExpandNode = ({
	data: { statePath = [], expandPathSegment, incomingState },
}: NodeProps<Node<DecisionTreeNodeData>>) => {
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
		<div
			className='nopan bg-background-light border-background-medium dark:border-primary-resting/30 relative h-25 overflow-hidden rounded-sm border-2'
			onMouseEnter={() => prefetch(project.id, nextPath)}
		>
			<Handle
				type='target'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3! opacity-0'
			/>
			<div className='grid h-full grid-cols-[1fr_auto]'>
				<IncomingStateDetails
					incomingState={incomingState}
					className='border-background-medium dark:border-primary-resting/30 h-full border-r-2'
				/>
				<Button
					variant='outlined'
					onClick={() => expandPathSegment && expandPath(expandPathSegment)}
					onFocus={() => prefetch(project.id, nextPath)}
					className='hover:bg-primary-hover-alt! bg-background-default! h-full! w-full! rounded-none! border-none! opacity-100!'
				>
					<Icon data={add} />
				</Button>
			</div>
		</div>
	);
};
