import { useReactFlow, NodeProps } from '@xyflow/react';
import { useState, Dispatch, SetStateAction, type PointerEvent as ReactPointerEvent } from 'react';
import { useUpdateWhiteboardNodes } from '../../../../hooks/api/useUpdateWhiteboardNodes';
import { ReactFlowWhiteboardNode } from '../../../../types';
import {
	parseArrowEndpoints,
	createArrowGeometry,
	fromNormalizedPoint,
	ARROW_HEAD_LENGTH,
	ARROW_VIEWBOX_SIZE,
	ARROW_STROKE_WIDTH,
} from '../arrowPath';
import { whiteboardNodeStrokeColor, whiteboardEndpointHandleStyle } from '../selectionStyles';

export const ArrowNode = ({ data, selected, setNodes }: ArrowNodeProps) => {
	const { getViewport, screenToFlowPosition } = useReactFlow<ReactFlowWhiteboardNode>();
	const { mutate: updateWhiteboardNodes } = useUpdateWhiteboardNodes();
	const [draggingEndpoint, setDraggingEndpoint] = useState<{
		endpoint: 'start' | 'end';
		otherPoint: { x: number; y: number };
		pointerId: number;
		headLength: number;
	} | null>(null);
	const resolvedWidth = data.width;
	const resolvedHeight = data.height;
	const resolvedPosition = {
		x: data.x_position,
		y: data.y_position,
	};
	const strokeOpacity = (data.opacity ?? 100) / 100;
	const endpoints = parseArrowEndpoints(data.data);
	const startHandle = endpoints?.start;
	const endHandle = endpoints?.end;

	const applyArrowGeometry = (geometry: ReturnType<typeof createArrowGeometry>) => {
		setNodes(currentNodes =>
			currentNodes.map(node => {
				if (node.id !== data.id) return node;
				return {
					...node,
					position: geometry.position,
					style: {
						...node.style,
						width: geometry.width,
						height: geometry.height,
						pointerEvents: 'none',
					},
					data: {
						...node.data,
						x_position: geometry.position.x,
						y_position: geometry.position.y,
						width: geometry.width,
						height: geometry.height,
						data: geometry.path,
					},
				};
			}),
		);
	};

	const getGeometryFromEvent = (
		event: ReactPointerEvent<HTMLDivElement>,
		endpointDrag: NonNullable<typeof draggingEndpoint>,
	) => {
		const draggedPoint = screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		});
		const startPoint =
			endpointDrag.endpoint === 'start' ? draggedPoint : endpointDrag.otherPoint;
		const endPoint = endpointDrag.endpoint === 'end' ? draggedPoint : endpointDrag.otherPoint;

		return createArrowGeometry(startPoint, endPoint, {
			headLength: endpointDrag.headLength,
		});
	};

	const clearDraggingEndpoint = () => {
		setDraggingEndpoint(current => (current ? null : current));
	};

	const handleEndpointPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!draggingEndpoint || event.pointerId !== draggingEndpoint.pointerId) return;
		event.preventDefault();
		event.stopPropagation();

		const geometry = getGeometryFromEvent(event, draggingEndpoint);
		applyArrowGeometry(geometry);
	};

	const handleEndpointPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!draggingEndpoint || event.pointerId !== draggingEndpoint.pointerId) return;
		event.preventDefault();
		event.stopPropagation();

		const geometry = getGeometryFromEvent(event, draggingEndpoint);
		updateWhiteboardNodes([
			{
				...data,
				x_position: geometry.position.x,
				y_position: geometry.position.y,
				width: geometry.width,
				height: geometry.height,
				data: geometry.path,
			},
		]);

		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		clearDraggingEndpoint();
	};

	const handleEndpointLostPointerCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!draggingEndpoint || event.pointerId !== draggingEndpoint.pointerId) return;
		event.preventDefault();
		event.stopPropagation();
		clearDraggingEndpoint();
	};

	const startAbsolute = startHandle
		? fromNormalizedPoint(startHandle, resolvedWidth, resolvedHeight)
		: null;
	const endAbsolute = endHandle
		? fromNormalizedPoint(endHandle, resolvedWidth, resolvedHeight)
		: null;

	const createEndpointPointerDown =
		(endpoint: 'start' | 'end', otherPoint: { x: number; y: number } | null) =>
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (!otherPoint) return;
			event.preventDefault();
			event.stopPropagation();
			event.currentTarget.setPointerCapture(event.pointerId);
			setDraggingEndpoint({
				endpoint,
				otherPoint,
				pointerId: event.pointerId,
				headLength: ARROW_HEAD_LENGTH / getViewport().zoom,
			});
		};

	return (
		<div className='relative h-full w-full overflow-visible'>
			<svg
				className='h-full w-full overflow-visible hover:cursor-pointer'
				viewBox={`0 0 ${ARROW_VIEWBOX_SIZE} ${ARROW_VIEWBOX_SIZE}`}
				preserveAspectRatio='none'
			>
				<path
					d={data.data}
					fill='none'
					stroke='transparent'
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={ARROW_STROKE_WIDTH}
					vectorEffect='non-scaling-stroke'
					pointerEvents='stroke'
				/>
				<path
					d={data.data}
					fill='none'
					stroke={
						data?.color && data.color === 'default'
							? whiteboardNodeStrokeColor
							: data.color
					}
					opacity={strokeOpacity}
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={data.stroke_width}
					vectorEffect='non-scaling-stroke'
					pointerEvents='none'
				/>
			</svg>
			{selected && startHandle && startAbsolute && (
				<div
					className={
						'nopan nodrag pointer-events-auto absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm'
					}
					style={{
						left: `${startHandle.x}%`,
						top: `${startHandle.y}%`,
					}}
					onPointerDown={createEndpointPointerDown('start', {
						x: resolvedPosition.x + (endAbsolute?.x ?? 0),
						y: resolvedPosition.y + (endAbsolute?.y ?? 0),
					})}
					onPointerMove={handleEndpointPointerMove}
					onPointerUp={handleEndpointPointerUp}
					onLostPointerCapture={handleEndpointLostPointerCapture}
					onPointerCancel={handleEndpointLostPointerCapture}
				>
					<div style={whiteboardEndpointHandleStyle} />
				</div>
			)}
			{selected && endHandle && endAbsolute && (
				<div
					className='nopan nodrag pointer-events-auto absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm'
					style={{
						left: `${endHandle.x}%`,
						top: `${endHandle.y}%`,
					}}
					onPointerDown={createEndpointPointerDown('end', {
						x: resolvedPosition.x + (startAbsolute?.x ?? 0),
						y: resolvedPosition.y + (startAbsolute?.y ?? 0),
					})}
					onPointerMove={handleEndpointPointerMove}
					onPointerUp={handleEndpointPointerUp}
					onLostPointerCapture={handleEndpointLostPointerCapture}
					onPointerCancel={handleEndpointLostPointerCapture}
				>
					<div style={whiteboardEndpointHandleStyle} />
				</div>
			)}
		</div>
	);
};

type ArrowNodeProps = NodeProps<ReactFlowWhiteboardNode> & {
	setNodes: Dispatch<SetStateAction<ReactFlowWhiteboardNode[]>>;
};
