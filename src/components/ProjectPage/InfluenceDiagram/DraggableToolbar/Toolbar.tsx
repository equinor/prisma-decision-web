import { useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { IconData } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNodes, useStore } from '@xyflow/react';
import { ReactFlowInfluenceNode } from '../../../../types';
import { cn } from '../../../../utils/cn';
import {} from '../../../../utils/convertNodeToInfluenceNode';
import { CreateIssues } from '../../CreateIssue';
import { DeleteIssuesDialog } from '../../DeleteIssuesDialog';
import { ToggleExpandAll } from '../../ToggleExpandAll';
import { ChangeIssueType } from './ChangeIssueType';
import { TogglePanMode } from './TogglePanMode';
import { ToggleSelectionMode } from './ToggleSelectionMode';
import { ZoomControls } from './ZoomControls';

export const Toolbar = ({ onClickPanMode, onClickSelectionMode }: ToolBarProps) => {
	const [toolBarPosition] = useLocalStorage('toolbar-position', 'top');
	const { ref, handleRef } = useDraggable({
		id: 'toolbar',
	});
	const isSelecting = useStore(state => state.selectNodesOnDrag);
	const selectedNodes = useNodes<ReactFlowInfluenceNode>().filter(node => node.selected);
	return (
		<div
			ref={ref}
			className={cn(
				`bg-background-default shadow-tile absolute
				left-1/2 z-10 flex w-max -translate-x-1/2 gap-2 rounded-sm p-2`,
				{
					'top-12': toolBarPosition === 'top',
					'bottom-12': toolBarPosition === 'bottom',
				},
			)}
		>
			<div className='-mx-1.5 flex cursor-grab items-center justify-center' ref={handleRef}>
				<Icon data={dragHandle} size={24} />
			</div>
			<ZoomControls />
			<div className='bg-background-light h-9 w-[2px]' />
			<TogglePanMode checked={!isSelecting} onChange={onClickPanMode} />
			<ToggleSelectionMode checked={isSelecting} onChange={onClickSelectionMode} />
			<ToggleExpandAll />
			<div className='bg-background-light h-9 w-[2px]' />
			<DeleteIssuesDialog nodes={selectedNodes} />
			<ChangeIssueType />
			<div className='bg-background-light h-9 w-[2px]' />
			<CreateIssues />
		</div>
	);
};

type ToolBarProps = {
	onClickPanMode: () => void;
	onClickSelectionMode: () => void;
};

const dragHandle: IconData = {
	name: 'drag_handle',
	prefix: 'custom',
	height: '16',
	width: '16',
	svgPathData:
		'M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"',
};
