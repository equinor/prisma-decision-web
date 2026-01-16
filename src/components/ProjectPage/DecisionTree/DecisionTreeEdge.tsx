import { Button, Icon } from '@equinor/eds-core-react';
import { collapse_screen } from '@equinor/eds-icons';
import {
	BaseEdge,
	EdgeLabelRenderer,
	EdgeProps,
	getSmoothStepPath,
	useNodes,
	Node,
	Edge,
} from '@xyflow/react';
import { useExpandedTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';

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
	target,
	animated,
	data,
}: EdgeProps<Edge<{ probability: number; outcomeName: string; utility: number }>>) => {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		borderRadius: 25,
	});
	const nodes = useNodes<Node<{ issue: Issue; path: Set<string> }>>();
	const sourceNode = nodes.find(n => n.id === source);
	const issue = useSelectedProjectIssues().find(issue => issue.id === sourceNode?.data?.issue.id);
	const { expanded, toggleExpanded } = useExpandedTreeNodes(target);

	if (!issue) return null;

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				className={cn('stroke-primary-resting! stroke-4!', {
					'stroke-emerald-600! stroke-8!': animated,
				})}
			/>
			<EdgeLabelRenderer>
				<div
					className='nodrag pointer-events-auto absolute origin-center'
					style={{
						transform: `translate(calc(-100% - 20px), -100%) translate(${targetX}px, ${targetY}px)`,
					}}
				>
					{data?.outcomeName}
				</div>
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
				{expanded && (
					<div
						className='nodrag nopan pointer-events-auto absolute z-2 origin-center'
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						}}
					>
						<Button className='p-1!' color='danger' onClick={toggleExpanded}>
							<Icon data={collapse_screen} />
						</Button>
					</div>
				)}
			</EdgeLabelRenderer>
		</>
	);
};
