import { useState, type PointerEvent } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import { useCreateWhiteboardNode } from '../../../../hooks/api/useCreateWhiteboardNode ';
import { useSetAtom } from 'jotai';
import { activeToolAtom } from '../activeToolAtom';
import { whiteboardPreviewStrokeColor } from '../selectionStyles';
import { useWhiteboardWheelZoom } from '../useWhiteboardWheelZoom';
import useSelectedWhiteboardSheet from '../../../../hooks/useSelectedWhiteboardSheet';
import { useSelectedProject } from '../../ProjectContext';

function getPosition(start: XYPosition, end: XYPosition) {
	return {
		x: Math.min(start.x, end.x),
		y: Math.min(start.y, end.y),
	};
}

function getDimensions(start: XYPosition, end: XYPosition, zoom: number = 1) {
	return {
		width: Math.abs(end.x - start.x) / zoom,
		height: Math.abs(end.y - start.y) / zoom,
	};
}

export function RectangleTool() {
	const [start, setStart] = useState<XYPosition | null>(null);
	const [end, setEnd] = useState<XYPosition | null>(null);
	const { screenToFlowPosition, getViewport } = useReactFlow();
	const { mutate: createWhiteboardNode } = useCreateWhiteboardNode();
	const selectedProject = useSelectedProject();
	const setActiveTool = useSetAtom(activeToolAtom);
	const handleWheelCapture = useWhiteboardWheelZoom();
	const sheet = useSelectedWhiteboardSheet();

	function handlePointerDown(e: PointerEvent) {
		(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
		setStart({ x: e.pageX, y: e.pageY });
	}

	function handlePointerMove(e: PointerEvent) {
		if (e.buttons !== 1) return;
		setEnd({ x: e.pageX, y: e.pageY });
	}

	function handlePointerUp() {
		if (!start || !end) return;
		const position = screenToFlowPosition(getPosition(start, end));
		const dimension = getDimensions(start, end, getViewport().zoom);
		const newNode = {
			type: 'Rectangle',
			x_position: position.x,
			y_position: position.y,
			width: dimension.width,
			height: dimension.height,
			color: 'default',
		};
		setActiveTool('pan');
		createWhiteboardNode({
			id: crypto.randomUUID(),
			x_position: newNode.x_position,
			y_position: newNode.y_position,
			width: newNode.width,
			height: newNode.height,
			color: newNode.color,
			type: 'Rectangle',
			project_id: selectedProject.id,
			data: '',
			rotation: 0,
			stroke_style: 'Solid',
			stroke_width: 8,
			new: true,
			board_sheet_id: sheet.id,
			zIndex: 0,
		});

		setStart(null);
		setEnd(null);
	}

	const rect =
		start && end
			? {
					position: getPosition(start, end),
					dimension: getDimensions(start, end),
				}
			: null;

	return (
		<div
			className='nopan nodrag absolute inset-0 z-4 h-full w-full origin-top-left cursor-copy'
			onWheelCapture={handleWheelCapture}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
		>
			{rect && (
				<div
					className='absolute z-10'
					style={{
						...rect.dimension,
						transform: `translate(${rect.position.x - 75}px, ${rect.position.y - 65}px)`,
						border: `2px dashed ${whiteboardPreviewStrokeColor}`,
						pointerEvents: 'none',
					}}
				></div>
			)}
		</div>
	);
}
