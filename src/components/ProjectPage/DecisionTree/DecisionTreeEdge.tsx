import { Button, Icon } from '@equinor/eds-core-react';
import { collapse_screen } from '@equinor/eds-icons';
import {
	BaseEdge,
	EdgeLabelRenderer,
	EdgeProps,
	getSmoothStepPath,
	Node,
	useNodes,
} from '@xyflow/react';
import { useExpandedTreeNodes } from '../../../hooks/useExpandedTreeNodes';
import { Issue } from '../../../validators';
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
	target,
	animated,
	data,
}: EdgeProps) => {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
	});
	const nodes = useNodes<Node<{ issue: Issue }>>();
	const sourceNode = nodes.find(n => n.id === source);
	const { expanded, toggleExpanded } = useExpandedTreeNodes(target);

	let outcomeName: string | undefined;
	let value: number | undefined;

	if (sourceNode?.data.issue.type === 'Uncertainty') {
		outcomeName = sourceNode.data.issue.uncertainty.outcomes.find(
			o => o.id === data?.valueId,
		)?.name;
		value = sourceNode.data.issue.uncertainty.outcomes.find(
			o => o.id === data?.valueId,
		)?.utility;
	}
	if (sourceNode?.data.issue.type === 'Decision') {
		outcomeName = sourceNode.data.issue.decision.options.find(
			o => o.id === data?.valueId,
		)?.name;
	}
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
					{outcomeName}
				</div>
				<div
					className='nodrag pointer-events-auto absolute origin-center'
					style={{
						transform: `translate(calc(-100% - 20px), 0%) translate(${targetX}px, ${targetY}px)`,
					}}
				>
					{value}
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
