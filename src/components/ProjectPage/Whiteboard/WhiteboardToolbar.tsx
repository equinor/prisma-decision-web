import { AddIssue } from '../../common/DraggableToolbar/AddIssue';
import { SheetPicker } from '../../common/DraggableToolbar/SheetPicker';
import { ToggleArrowMode } from '../../common/DraggableToolbar/ToggleArrowMode';
import { ToggleFreehandMode } from '../../common/DraggableToolbar/ToggleFreehandMode';
import { TogglePanMode } from '../../common/DraggableToolbar/TogglePanMode';
import { ToggleRectangleMode } from '../../common/DraggableToolbar/ToggleRectangleMode';
import { ToggleSelectionMode } from '../../common/DraggableToolbar/ToggleSelectionMode';
import { ToggleTextMode } from '../../common/DraggableToolbar/ToggleTextMode';
import {
	ToolBar,
	ToolbarDragDropProvider,
	ToolbarSeparator,
} from '../../common/DraggableToolbar/Toolbar';
import { ZoomControls } from '../../common/DraggableToolbar/ZoomControls';

export const WhiteboardToolbar = () => {
	return (
		<ToolbarDragDropProvider>
			<ToolBar>
				<ZoomControls />
				<ToolbarSeparator />
				<TogglePanMode />
				<ToggleSelectionMode />
				<ToggleRectangleMode />
				<ToggleArrowMode />
				<ToggleTextMode />
				<ToggleFreehandMode />
				<AddIssue />
				<ToolbarSeparator />
				<SheetPicker />
			</ToolBar>
		</ToolbarDragDropProvider>
	);
};
