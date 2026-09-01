import { useRef, useState, type PointerEvent } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import { useSetAtom } from 'jotai';
import { useCreateWhiteboardNode } from '../../../../hooks/api/useCreateWhiteboardNode ';
import { activeToolAtom } from '../activeToolAtom';
import { ARROW_HEAD_LENGTH, ARROW_VIEWBOX_SIZE, createArrowGeometry } from '../arrowPath';
import { whiteboardPreviewStrokeColor } from '../selectionStyles';
import { useWhiteboardWheelZoom } from '../useWhiteboardWheelZoom';
import useSelectedWhiteboardSheet from '../../../../hooks/useSelectedWhiteboardSheet';
import { useSelectedProject } from '../../ProjectContext';

export function ArrowTool() {
	const [start, setStart] = useState<XYPosition | null>(null);
	const [end, setEnd] = useState<XYPosition | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const { screenToFlowPosition, getViewport } = useReactFlow();
	const { mutate: createWhiteboardNode } = useCreateWhiteboardNode();
	const selectedProject = useSelectedProject();
	const setActiveTool = useSetAtom(activeToolAtom);
	const handleWheelCapture = useWhiteboardWheelZoom();
	const sheet = useSelectedWhiteboardSheet();

	function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
		(e.target as HTMLDivElement).setPointerCapture(e.pointerId);
		setStart({ x: e.clientX, y: e.clientY });
		setEnd(null);
	}

	function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
		if (e.buttons !== 1 || !start) return;
		setEnd({ x: e.clientX, y: e.clientY });
	}

	function handlePointerUp() {
		if (!start || !end) return;

		const startPosition = screenToFlowPosition(start);
		const endPosition = screenToFlowPosition(end);
		const geometry = createArrowGeometry(startPosition, endPosition, {
			headLength: ARROW_HEAD_LENGTH / getViewport().zoom,
		});

		setActiveTool('pan');
		createWhiteboardNode({
			id: crypto.randomUUID(),
			x_position: geometry.position.x,
			y_position: geometry.position.y,
			width: geometry.width,
			height: geometry.height,
			type: 'Arrow',
			color: 'default',
			project_id: selectedProject.id,
			data: geometry.path,
			rotation: 0,
			stroke_style: 'Solid',
			stroke_width: 4,
			board_sheet_id: sheet.id,
			zIndex: 0,
		});

		setStart(null);
		setEnd(null);
	}

	const bounds = containerRef.current?.getBoundingClientRect();
	const preview =
		start && end && bounds
			? createArrowGeometry(
					{ x: start.x - bounds.left, y: start.y - bounds.top },
					{ x: end.x - bounds.left, y: end.y - bounds.top },
					{ headLength: ARROW_HEAD_LENGTH },
				)
			: null;

	return (
		<div
			ref={containerRef}
			className='nopan nodrag absolute inset-0 z-4 h-full w-full origin-top-left cursor-copy'
			onWheelCapture={handleWheelCapture}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
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
					viewBox={`0 0 ${ARROW_VIEWBOX_SIZE} ${ARROW_VIEWBOX_SIZE}`}
					preserveAspectRatio='none'
				>
					<path
						d={preview.path}
						fill='none'
						stroke={whiteboardPreviewStrokeColor}
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={4}
						vectorEffect='non-scaling-stroke'
					/>
				</svg>
			)}
		</div>
	);
}
