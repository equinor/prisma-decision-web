import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { useUpdateWhiteboardNodes } from '../../../hooks/api/useUpdateWhiteboardNodes';
import { ReactFlowWhiteboardNode } from '../../../types';
import { FREEHAND_BASE_STROKE_WIDTH, scaleFreehandPath } from './freehandPath';
import {
	whiteboardNodeStrokeColor,
	whiteboardNodeResizerHandleStyle,
	whiteboardNodeResizerLineStyle,
} from './selectionStyles';

export const FreehandNode = ({ data, selected }: NodeProps<ReactFlowWhiteboardNode>) => {
	const { getNodes } = useReactFlow<ReactFlowWhiteboardNode>();
	const { mutate: updateWhiteboardNodes } = useUpdateWhiteboardNodes();
	const resolvedWidth = Math.max(data.width ?? 1, 1);
	const resolvedHeight = Math.max(data.height ?? 1, 1);
	const strokeOpacity = (data.opacity ?? 100) / 100;

	return (
		<>
			<NodeResizer
				isVisible={selected}
				onResizeEnd={() => {
					const nodes = getNodes();
					const node = nodes.find(node => node.id === data.id);
					if (!node) return;

					const nextWidth = Math.max(node.width || 0, 1);
					const nextHeight = Math.max(node.height || 0, 1);
					const currentWidth = Math.max(data.width || 0, 1);
					const currentHeight = Math.max(data.height || 0, 1);

					updateWhiteboardNodes([
						{
							...node.data,
							width: nextWidth,
							height: nextHeight,
							x_position: node.position.x,
							y_position: node.position.y,
							data: scaleFreehandPath(
								data.data,
								nextWidth / currentWidth,
								nextHeight / currentHeight,
							),
						},
					]);
				}}
				handleStyle={whiteboardNodeResizerHandleStyle}
				lineStyle={whiteboardNodeResizerLineStyle}
			/>
			<svg
				className='h-full w-full overflow-visible hover:cursor-pointer'
				viewBox={`0 0 ${resolvedWidth} ${resolvedHeight}`}
				preserveAspectRatio='none'
			>
				<path
					d={data.data}
					fill='transparent'
					stroke='transparent'
					strokeWidth={18}
					vectorEffect='non-scaling-stroke'
					pointerEvents='stroke'
				/>
				<path
					d={data.data}
					stroke={
						data?.color && data.color === 'default'
							? whiteboardNodeStrokeColor
							: data.color
					}
					fill={
						data?.color && data.color === 'default'
							? whiteboardNodeStrokeColor
							: data.color
					}
					opacity={strokeOpacity}
					strokeWidth={Math.max((data.stroke_width ?? 4) - FREEHAND_BASE_STROKE_WIDTH, 0)}
					strokeLinejoin='round'
					paintOrder='stroke fill'
					vectorEffect='non-scaling-stroke'
					pointerEvents='fill'
				/>
			</svg>
		</>
	);
};
