import { DragDropProvider, DragEndEvent, DragOverlay, useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { drag_indicator } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useReactFlow } from '@xyflow/react';
import { useCreateWhiteboardNode } from '../../../../hooks/api/useCreateWhiteboardNode ';
import useSelectedWhiteboardSheet from '../../../../hooks/useSelectedWhiteboardSheet';
import { cn } from '../../../../utils/cn';
import {
	IssueCard as IssueCardComponent,
	IssueCardContent,
	IssueCardHeader,
} from '../../../common/Cards/IssueCard';
import { useSelectedProject } from '../../ProjectContext';
import { ZoomControls } from '../../ZoomControls';
import { AddIssue } from './AddIssue';
import { SheetPicker } from './SheetPicker';
import { ToggleArrowMode } from './ToggleArrowMode';
import { ToggleFreehandMode } from './ToggleFreehandMode';
import { TogglePanMode } from './TogglePanMode';
import { ToggleRectangleMode } from './ToggleRectangleMode';
import { ToggleSelectionMode } from './ToggleSelectionMode';
import { ToggleTextMode } from './ToggleTextMode';

export const Toolbar = () => {
	const [toolBarPosition] = useLocalStorage('toolbar-position-whiteboard', 'top');
	const { ref, handleRef } = useDraggable({
		id: 'toolbar',
	});

	const { screenToFlowPosition } = useReactFlow();
	const { mutate: createWhiteboardNode } = useCreateWhiteboardNode();

	const selectedProject = useSelectedProject();
	const sheet = useSelectedWhiteboardSheet();

	const onDragEnd = (e: DragEndEvent) => {
		const sourceId = e.operation.source?.data.issue.id;
		if (!sourceId) return;

		const { x, y } = e.operation.position.current;
		const translatedBounds = e.operation.shape?.current.boundingRectangle;
		const nodeWidth = translatedBounds?.width ?? 0;
		const nodeHeight = translatedBounds?.height ?? 0;

		const center = screenToFlowPosition({
			x: translatedBounds ? translatedBounds.left + nodeWidth / 2 : x,
			y: translatedBounds ? translatedBounds.top + nodeHeight / 2 : y,
		});
		createWhiteboardNode({
			id: crypto.randomUUID(),
			x_position: center.x - nodeWidth / 2,
			y_position: center.y - nodeHeight / 2,
			width: 0,
			height: 0,
			type: 'Issue',
			project_id: selectedProject.id,
			data: sourceId,
			rotation: 0,
			board_sheet_id: sheet.id,
			zIndex: 0,
		});
	};

	return (
		<DragDropProvider onDragEnd={onDragEnd}>
			<div
				ref={ref}
				className={cn('canvas-toolbar', {
					'top-6': toolBarPosition === 'top',
					'bottom-6': toolBarPosition === 'bottom',
				})}
			>
				<div className='toolbar-drag-handle' ref={handleRef}>
					<Icon data={drag_indicator} />
				</div>
				<div className='toolbar-group toolbar-view-controls'>
					<ZoomControls />
				</div>
				<div className='toolbar-divider' />
				<div className='toolbar-group'>
					<TogglePanMode />
					<ToggleSelectionMode />
					<ToggleRectangleMode />
					<ToggleArrowMode />
					<ToggleTextMode />
					<ToggleFreehandMode />
					<AddIssue />
				</div>
				<div className='toolbar-divider' />

				<SheetPicker />
				<DragOverlay dropAnimation={null}>
					{source => {
						return (
							<IssueCardComponent issue={source.data.issue} className='w-64'>
								<IssueCardHeader />
								<IssueCardContent />
							</IssueCardComponent>
						);
					}}
				</DragOverlay>
			</div>
		</DragDropProvider>
	);
};
