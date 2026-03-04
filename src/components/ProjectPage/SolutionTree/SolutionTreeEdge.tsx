import {
	BaseEdge,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	getSmoothStepPath,
	Node,
	useNodes,
} from '@xyflow/react';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';

export const SolutionTreeEdge = ({
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
}: EdgeProps<Edge<{ probability: number; outcomeName: string; utility: number }>>) => {
	const [edgePath] = getSmoothStepPath({
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
			</EdgeLabelRenderer>
		</>
	);
};
