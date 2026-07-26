import { Button, Icon } from '@equinor/eds-core-react';
import { collapse_screen } from '@equinor/eds-icons';
import {
	BaseEdge,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	Node,
	getSmoothStepPath,
	useNodes,
} from '@xyflow/react';
import { useLocation } from 'react-router';
import { useExpandedTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { cn } from '../../../utils/cn';
import { DecisionTreeNodeData, DecisionTreeOutputNodeData } from './types';

export const DecisionTreeEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	markerEnd,
	target,
	animated,
}: EdgeProps<Edge>) => {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		borderRadius: 8,
	});
	const location = useLocation();
	const treeType = location.pathname.includes('solution') ? 'solution' : 'decision';
	const nodes = useNodes<Node<DecisionTreeNodeData | DecisionTreeOutputNodeData>>();
	const targetNode = nodes.find(node => node.id === target);
	const expandPathSegment =
		targetNode && 'expandPathSegment' in targetNode.data
			? targetNode.data.expandPathSegment
			: undefined;
	const collapsePath =
		targetNode?.type === 'expandNode'
			? [
					...(targetNode.data.statePath || []),
					...(expandPathSegment ? [expandPathSegment] : []),
				]
			: (targetNode?.data.statePath ?? []);
	const { expanded, closePath } = useExpandedTreeNodes(collapsePath, treeType);

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				className={cn('stroke-primary-resting! stroke-4!', {
					'stroke-emerald-600!': animated,
				})}
			/>
			{expanded && collapsePath.length > 0 && (
				<EdgeLabelRenderer>
					<div
						className='nodrag nopan pointer-events-auto absolute z-2 origin-center'
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						}}
					>
						<Button className='p-1!' color='danger' onClick={closePath}>
							<Icon data={collapse_screen} />
						</Button>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};
