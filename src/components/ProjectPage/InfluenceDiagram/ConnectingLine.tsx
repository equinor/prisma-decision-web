import { ConnectionLineComponentProps, getSmoothStepPath, useConnection } from '@xyflow/react';

export const ConnectionLine = ({
	fromX,
	fromY,
	toX,
	toY,
	fromPosition,
	toPosition,
}: ConnectionLineComponentProps) => {
	const { fromHandle } = useConnection();

	const [edgePath] = getSmoothStepPath({
		sourceX: fromX,
		sourceY: fromY,
		targetX: toX,
		targetY: toY,
		sourcePosition: fromPosition,
		targetPosition: toPosition,
	});
	if (!fromHandle?.id) return null;
	return (
		<g>
			<path
				fill='none'
				stroke={fromHandle.id}
				strokeWidth={1.5}
				className='animated stroke-primary-resting stroke-4'
				d={edgePath}
			/>
			<circle cx={toX} cy={toY} fill='#fff' r={3} stroke={fromHandle.id} strokeWidth={1.5} />
		</g>
	);
};
