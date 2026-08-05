import { useKeyHold } from '@tanstack/react-hotkeys';
import { NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import { useUpdateWhiteboardNodes } from '../../../../hooks/api/useUpdateWhiteboardNodes';
import { ReactFlowWhiteboardNode } from '../../../../types';
import {
	whiteboardNodeStrokeColor,
	whiteboardNodeResizerHandleStyle,
	whiteboardNodeResizerLineStyle,
} from '../selectionStyles';

const snapGridSize = 30;

const snapToGrid = (value: number) => snapGridSize * Math.round(value / snapGridSize);

export const RectangleNode = ({
	data,
	selected,
	width,
	height,
}: NodeProps<ReactFlowWhiteboardNode>) => {
	const { getNodes } = useReactFlow<ReactFlowWhiteboardNode>();
	const { mutate: updateWhiteboardNodes } = useUpdateWhiteboardNodes();
	const enableSnapToGrid = useKeyHold('Shift');
	const resolvedWidth = width ?? data.width;
	const resolvedHeight = height ?? data.height;
	const strokeInset = (data.stroke_width ?? 0) / 2;
	const rectWidth = Math.max(resolvedWidth - (data.stroke_width ?? 0), 0);
	const rectHeight = Math.max(resolvedHeight - (data.stroke_width ?? 0), 0);
	const strokeOpacity = (data.opacity ?? 100) / 100;
	let lineStyle = '';
	if (data.stroke_style === 'Dashed') lineStyle = '16 16';
	if (data.stroke_style === 'Dotted') lineStyle = '3 10';
	return (
		<>
			<NodeResizer
				isVisible={selected}
				onResizeEnd={() => {
					const nodes = getNodes();
					const node = nodes.find(n => n.id === data.id);
					if (!node) return;
					const xPosition = enableSnapToGrid
						? snapToGrid(node.position.x)
						: node.position.x;
					const yPosition = enableSnapToGrid
						? snapToGrid(node.position.y)
						: node.position.y;
					const width = node.width ?? data.width;
					const height = node.height ?? data.height;
					const snappedWidth = enableSnapToGrid
						? Math.max(snapToGrid(node.position.x + width) - xPosition, snapGridSize)
						: width;
					const snappedHeight = enableSnapToGrid
						? Math.max(snapToGrid(node.position.y + height) - yPosition, snapGridSize)
						: height;
					updateWhiteboardNodes([
						{
							...node.data,
							width: snappedWidth,
							height: snappedHeight,
							x_position: xPosition,
							y_position: yPosition,
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
				<rect
					x={0}
					y={0}
					width={resolvedWidth}
					height={resolvedHeight}
					rx={2}
					ry={2}
					fill='transparent'
					pointerEvents='all'
				/>
				<rect
					x={strokeInset}
					y={strokeInset}
					width={rectWidth}
					height={rectHeight}
					rx={12}
					ry={12}
					strokeDasharray={lineStyle}
					fill='none'
					stroke={
						data?.color && data.color === 'default'
							? whiteboardNodeStrokeColor
							: data.color
					}
					opacity={strokeOpacity}
					strokeWidth={data.stroke_width}
					vectorEffect='non-scaling-stroke'
					strokeLinecap='round'
					strokeLinejoin='round'
					pointerEvents='none'
				/>
			</svg>
		</>
	);
};
