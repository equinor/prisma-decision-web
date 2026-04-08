import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import {
	BaseEdge,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	getSmoothStepPath,
	useReactFlow,
} from '@xyflow/react';
import { useDeleteEdge } from '../../../hooks/api/useDeleteEdge';
import { InfluenceEdgeData } from '../../../utils/convertToInfluenceEdges';

export const InfluenceEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	markerEnd,
	data,
}: EdgeProps<Edge<InfluenceEdgeData>>) => {
	const [fallbackPath, fallbackLabelX, fallbackLabelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		borderRadius: 25,
	});

	const edgePath = data?.route?.path ?? fallbackPath;
	const labelX = data?.route?.labelX ?? fallbackLabelX;
	const labelY = data?.route?.labelY ?? fallbackLabelY;

	const { mutate: deleteEdge } = useDeleteEdge();
	const { setEdges } = useReactFlow();
	const handleDelete = () => {
		deleteEdge(id);
		setEdges([]);
	};
	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
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
