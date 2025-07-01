import { ConnectionLineComponentProps, useConnection } from '@xyflow/react';

export const ConnectionLine = ({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) => {
	const { fromHandle } = useConnection();
	if (!fromHandle?.id) return null;
	return (
		<g>
			<path
				fill='none'
				stroke={fromHandle.id}
				strokeWidth={1.5}
				className='animated stroke-primary-resting stroke-4'
				d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
			/>
			<circle cx={toX} cy={toY} fill='#fff' r={3} stroke={fromHandle.id} strokeWidth={1.5} />
		</g>
	);
};
