import { useReactFlow, useViewport } from '@xyflow/react';
import { type PointerEvent, useMemo, useRef, useState } from 'react';
import { useCreateWhiteboardNode } from '../../../hooks/api/useCreateWhiteboardNode ';
import { createFreehandGeometry, type FreehandInputPoint } from './freehandPath';
import { whiteboardPreviewStrokeColor } from './selectionStyles';
import { useWhiteboardWheelZoom } from './useWhiteboardWheelZoom';
import useSelectedWhiteboardSheet from '../../../hooks/useSelectedWhiteboardSheet';
import { useSelectedProject } from '../ProjectContext';

export const FreehandTool = () => {
	const [points, setPoints] = useState<FreehandInputPoint[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const { screenToFlowPosition } = useReactFlow();
	const { zoom } = useViewport();
	const { mutate: createWhiteboardNode } = useCreateWhiteboardNode();
	const selectedProject = useSelectedProject();
	const handleWheelCapture = useWhiteboardWheelZoom();
	const sheet = useSelectedWhiteboardSheet();

	const preview = useMemo(() => {
		const bounds = containerRef.current?.getBoundingClientRect();
		if (!bounds || points.length === 0) return null;

		return createFreehandGeometry(
			points.map(([x, y]) => [x - bounds.left, y - bounds.top]),
			{ size: 4 * zoom },
		);
	}, [points, zoom]);

	const reset = () => {
		setPoints([]);
	};

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		setPoints([[event.clientX, event.clientY]]);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (event.buttons !== 1 || points.length === 0) return;

		const samples = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
		setPoints(current => [
			...current,
			...samples.map(sample => [sample.clientX, sample.clientY] as FreehandInputPoint),
		]);
	};

	const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		if (points.length === 0) {
			reset();
			return;
		}
		const flowPoints = points.map(([x, y]) => {
			const position = screenToFlowPosition({ x, y });
			return [position.x, position.y] as FreehandInputPoint;
		});
		const geometry = createFreehandGeometry(flowPoints);

		createWhiteboardNode({
			id: crypto.randomUUID(),
			x_position: geometry.position.x,
			y_position: geometry.position.y,
			width: geometry.width,
			height: geometry.height,
			type: 'Freehand',
			project_id: selectedProject.id,
			data: geometry.path,
			rotation: 0,
			stroke_style: 'Solid',
			stroke_width: 4,
			color: 'default',
			board_sheet_id: sheet?.id,
			zIndex: 0,
		});

		reset();
	};

	const handlePointerCancel = () => {
		reset();
	};

	return (
		<div
			ref={containerRef}
			className='nopan nodrag absolute inset-0 z-4 h-full w-full origin-top-left cursor-crosshair'
			style={{ touchAction: 'none' }}
			onWheelCapture={handleWheelCapture}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerCancel}
		>
			{preview && (
				<svg
					className='absolute z-10 overflow-visible'
					style={{
						transform: `translate(${preview.position.x}px, ${preview.position.y}px)`,
						width: preview.width,
						height: preview.height,
						pointerEvents: 'none',
						position: 'absolute',
					}}
					viewBox={`0 0 ${preview.width} ${preview.height}`}
					preserveAspectRatio='none'
				>
					<path d={preview.path} fill={whiteboardPreviewStrokeColor} strokeWidth={2} />
				</svg>
			)}
		</div>
	);
};
