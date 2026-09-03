import { type MouseEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useCreateWhiteboardNode } from '../../../../hooks/api/useCreateWhiteboardNode ';
import { useSetAtom } from 'jotai';
import { activeToolAtom } from '../activeToolAtom';
import { useWhiteboardWheelZoom } from '../useWhiteboardWheelZoom';
import useSelectedWhiteboardSheet from '../../../../hooks/useSelectedWhiteboardSheet';
import { useSelectedProject } from '../../ProjectContext';

export function TextTool() {
	const { screenToFlowPosition } = useReactFlow();
	const sheet = useSelectedWhiteboardSheet();
	const setActiveTool = useSetAtom(activeToolAtom);
	const { mutate: createWhiteboardNode } = useCreateWhiteboardNode();
	const selectedProject = useSelectedProject();
	const handleWheelCapture = useWhiteboardWheelZoom();

	function handleClick(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		const position = screenToFlowPosition({ x: e.pageX, y: e.pageY });
		setActiveTool('pan');
		createWhiteboardNode({
			id: crypto.randomUUID(),
			x_position: position.x,
			y_position: position.y,
			width: 0,
			height: 0,
			text_size: 24,
			type: 'Text',
			project_id: selectedProject.id,
			data: 'text',
			rotation: 0,
			new: true,
			board_sheet_id: sheet?.id ?? '',
			zIndex: 0,
		});
	}

	return (
		<div
			className='nopan nodrag absolute inset-0 z-4 h-full w-full origin-top-left cursor-text'
			onWheelCapture={handleWheelCapture}
			onClick={handleClick}
		/>
	);
}
