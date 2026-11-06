import { AddIssue } from '../../common/DraggableToolbar/AddIssue';
import { ClearSheet } from '../../common/DraggableToolbar/ClearSheet';
import { SheetPicker } from '../../common/DraggableToolbar/SheetPicker';
import { ToggleArrowMode } from '../../common/DraggableToolbar/ToggleArrowMode';
import { ToggleFreehandMode } from '../../common/DraggableToolbar/ToggleFreehandMode';
import { TogglePanMode } from '../../common/DraggableToolbar/TogglePanMode';
import { ToggleRectangleMode } from '../../common/DraggableToolbar/ToggleRectangleMode';
import { ToggleSelectionMode } from '../../common/DraggableToolbar/ToggleSelectionMode';
import { ToggleTextMode } from '../../common/DraggableToolbar/ToggleTextMode';
import { DraggableToolbar } from '../../common/DraggableToolbar/DraggableToolbar';
import {
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarToolGroup,
} from '../../common/DraggableToolbar/Toolbar';
import { ZoomControls } from '../../common/DraggableToolbar/ZoomControls';

export const WhiteboardToolbar = () => {
	return (
		<DraggableToolbar aria-label='Whiteboard toolbar'>
			<ZoomControls />
			<ToolbarSeparator />
			<ToolbarGroup aria-label='Whiteboard tools'>
				<ToolbarToolGroup aria-label='Tool modes'>
					<TogglePanMode />
					<ToggleSelectionMode />
					<ToggleRectangleMode />
					<ToggleArrowMode />
					<ToggleTextMode />
					<ToggleFreehandMode />
				</ToolbarToolGroup>
				<AddIssue />
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup aria-label='Sheet controls'>
				<SheetPicker />
				<ClearSheet />
			</ToolbarGroup>
		</DraggableToolbar>
	);
};
