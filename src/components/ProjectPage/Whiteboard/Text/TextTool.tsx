import { type MouseEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useSelectedProject } from '../../../../hooks/useSelectedProject';
import { useCreateWhiteboardNode } from '../../../../hooks/api/useCreateWhiteboardNode ';
import { useSetAtom } from 'jotai';
import { activeToolAtom } from '../activeToolAtom';
import { useWhiteboardWheelZoom } from '../useWhiteboardWheelZoom';

export function TextTool() {
	const { screenToFlowPosition } = useReactFlow();
	const setActiveTool = useSetAtom(activeToolAtom);
	const { mutate: createWhiteboardNode } = useCreateWhiteboardNode();
	const selectedProject = useSelectedProject();
	const handleWheelCapture = useWhiteboardWheelZoom();

	function handleClick(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!selectedProject) return;

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
