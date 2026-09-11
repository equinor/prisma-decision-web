import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { collapse_screen } from '@equinor/eds-icons';
import {
	BaseEdge,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	getSmoothStepPath,
	Node,
	useNodes,
} from '@xyflow/react';
import { useLocation } from 'react-router';
import { useExpandedTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { cn } from '../../../utils/cn';

export const DecisionTreeEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	markerEnd,
	source,
	animated,
	data,
}: EdgeProps<Edge<{ probability: number; utility: number; stateId: string; pruned: boolean }>>) => {
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
	const nodes = useNodes<Node<{ issueId: string; statePath: string[] }>>();
	const sourceNode = nodes.find(n => n.id === source);
	const issue = useSelectedProjectIssues().find(issue => issue.id === sourceNode?.data?.issueId);
	const path = sourceNode ? [...sourceNode.data.statePath, data?.stateId || ''] : [];
	const { expanded, closePath } = useExpandedTreeNodes(path, treeType);

	if (!issue) return null;
	const stateName =
		issue.type === 'Uncertainty'
			? issue.uncertainty.outcomes.find(o => o.id === data?.stateId)?.name
			: issue.decision.options.find(o => o.id === data?.stateId)?.name;

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				style={{ strokeDasharray: data?.pruned ? '12 8' : undefined }}
				className={cn('stroke-primary-resting! stroke-4!', {
					'stroke-emerald-600!': animated,
				})}
			/>
			<EdgeLabelRenderer>
				<Tooltip title={stateName} placement='top'>
					<div
						className='nodrag pointer-events-auto absolute max-w-30 origin-center truncate'
						style={{
							transform: `translate(calc(-100% - 20px), -100%) translate(${targetX}px, ${targetY}px)`,
						}}
					>
						{stateName}
					</div>
				</Tooltip>
				{!data?.pruned && (
					<div
						className='nodrag pointer-events-auto absolute origin-center text-end'
						style={{
							transform: `translate(calc(-100% - 20px), 5%) translate(${targetX}px, ${targetY}px)`,
						}}
					>
						{issue.type === 'Uncertainty' && (
							<div>
								<p>
									<span className='font-semibold'>Prob: </span>
									{Math.round((data?.probability || 0) * 100) / 100}
								</p>
							</div>
						)}
						<div>
							<p>
								<span className='font-semibold'>Utility:</span>{' '}
								{Math.round(data?.utility || 0)}
							</p>
						</div>
					</div>
				)}
				{expanded && (
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
				)}
			</EdgeLabelRenderer>
		</>
	);
};
