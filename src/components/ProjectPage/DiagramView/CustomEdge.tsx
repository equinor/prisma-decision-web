import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import {
	EdgeProps,
	getSmoothStepPath,
	useReactFlow,
	BaseEdge,
	EdgeLabelRenderer,
} from '@xyflow/react';

export const CustomEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	markerEnd,
}: EdgeProps) => {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
	});

	const { setEdges } = useReactFlow();

	const handleDelete = () => {
		setEdges(eds => eds.filter(edge => edge.id !== id));
	};

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				className='stroke-primary-resting! stroke-4!'
			/>
			<EdgeLabelRenderer>
				<div
					className='nodrag nopan pointer-events-auto absolute origin-center'
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}
				>
					<Button color='danger' className='p-1!' onClick={handleDelete}>
						<Icon data={delete_to_trash} />
					</Button>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};
