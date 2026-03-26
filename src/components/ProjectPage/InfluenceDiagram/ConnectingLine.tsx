import { ConnectionLineComponentProps, getStraightPath } from '@xyflow/react';

export const ConnectionLine = ({ toX, toY, fromX, fromY }: ConnectionLineComponentProps) => {
	const [edgePath] = getStraightPath({
		sourceX: fromX,
		sourceY: fromY,
		targetX: toX,
		targetY: toY,
	});

	return (
		<g>
			<path
				fill='none'
				strokeWidth={1.5}
				className='animated stroke-primary-resting stroke-4'
				d={edgePath}
			/>
			<circle
				cx={toX}
				cy={toY}
				fill='#fff'
				r={3}
				className='stroke-primary-resting'
				strokeWidth={1.5}
			/>
		</g>
	);
};
