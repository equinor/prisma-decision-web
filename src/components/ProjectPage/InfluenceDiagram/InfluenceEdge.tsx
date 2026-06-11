import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, useReactFlow } from '@xyflow/react';
import { useAnimatedInfluenceRoute } from '../../../hooks/useAnimatedInfluenceRoute';
import { ReactFlowInfluenceNode } from '../../../types';
import { InfluenceEdgeData } from '../../../utils/convertToInfluenceEdges';

export const InfluenceEdge = ({ id, markerEnd, data }: EdgeProps<Edge<InfluenceEdgeData>>) => {
	const path = useAnimatedInfluenceRoute(data?.route);
	const labelX = data?.route?.labelX ?? 0;
	const labelY = data?.route?.labelY ?? 0;

	const { deleteElements } = useReactFlow<ReactFlowInfluenceNode, Edge<InfluenceEdgeData>>();
	const handleDelete = async () => {
		deleteElements({ edges: [{ id }] });
	};
	return (
		<>
			<BaseEdge
				id={id}
				path={path}
				markerEnd={markerEnd}
				interactionWidth={60}
				className='stroke-primary-resting! stroke-4!'
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
