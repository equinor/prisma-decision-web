import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, useReactFlow } from '@xyflow/react';
import { useAnimatedInfluenceRoute } from '../../../hooks/useAnimatedInfluenceRoute';
import { ReactFlowInfluenceNode } from '../../../types';
import { InfluenceEdgeData } from '../../../utils/convertToInfluenceEdges';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { cn } from '../../../utils/cn';

export const InfluenceEdge = ({ id, data }: EdgeProps<Edge<InfluenceEdgeData>>) => {
	const path = useAnimatedInfluenceRoute(data?.route);
	const {
		validationErrors: { edgesInLoop },
	} = useHasInfluenceDiagramError();
	const labelX = data?.route?.labelX ?? 0;
	const labelY = data?.route?.labelY ?? 0;

	const { deleteElements } = useReactFlow<ReactFlowInfluenceNode, Edge<InfluenceEdgeData>>();
	const handleDelete = async () => {
		deleteElements({ edges: [{ id }] });
	};
	return (
		<>
			<svg>
				<defs>
					<marker
						className='react-flow__arrowhead'
						id={id}
						markerWidth='12.5'
						markerHeight='12.5'
						viewBox='-10 -10 20 20'
						markerUnits='strokeWidth'
						orient='auto-start-reverse'
						refX='0'
						refY='0'
					>
						<polyline
							className={cn('arrowclosed', {
								'fill-warning-resting! stroke-warning-resting!': edgesInLoop.find(
									x => x.id === id,
								),
								'fill-primary-resting! stroke-primary-resting!': !edgesInLoop.find(
									x => x.id === id,
								),
							})}
							strokeLinecap='round'
							strokeLinejoin='round'
							points='-5,-4 0,0 -5,4 -5,-4'
						></polyline>
					</marker>
				</defs>
			</svg>
			<BaseEdge
				id={id}
				path={path}
				interactionWidth={60}
				markerEnd={`url(#${id})`}
				className={cn('stroke-primary-resting! stroke-4!', {
					'stroke-warning-resting!': edgesInLoop.find(x => x.id === id),
				})}
			/>
			{data?.hovered && (
				<EdgeLabelRenderer>
					<div
						className='nodrag nopan bg-background-light pointer-events-auto absolute origin-center'
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						}}
					>
						<Button
							variant='ghost_icon'
							className='p-1!'
							color='danger'
							onClick={handleDelete}
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};
