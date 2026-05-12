import { useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNodes, useStore } from '@xyflow/react';
import { useGetInfluenceDiagramErrors } from '../../../../hooks/api/useGetInfluenceDiagramErrors';
import { useSelectedProject } from '../../../../hooks/useSelectedProject';
import { dragHandle } from '../../../../icons';
import { ReactFlowInfluenceNode } from '../../../../types';
import { cn } from '../../../../utils/cn';
import {} from '../../../../utils/convertNodeToInfluenceNode';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { CreateIssues } from '../../../common/CreateIssue';
import { DeleteIssuesDialog } from '../../../common/DeleteIssuesDialog';
import { ToggleExpandAll } from '../../ToggleExpandAll';
import {
	InfluenceDiagramValidation,
	ValidateProbabilityTable,
} from '../InfluenceDiagramValidation';
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
	const selectedProject = useSelectedProject();

	const { data: errors } = useGetInfluenceDiagramErrors(selectedProject?.id);
	const issues = useSelectedProjectIssues();
	const hasValidationErrors = !!errors?.message || ValidateProbabilityTable(issues);
	return (
		<div
			ref={ref}
			className={cn(
				`bg-background-default shadow-tile absolute
				left-1/2 z-10 flex w-max -translate-x-1/2 gap-2 rounded-sm p-2`,
				{
					'top-6': toolBarPosition === 'top',
					'bottom-6': toolBarPosition === 'bottom',
				},
			)}
		>
			<div className='-mx-1.5 flex cursor-grab items-center justify-center' ref={handleRef}>
				<Icon data={dragHandle} size={24} />
			</div>
			<ZoomControls />
			<div className='bg-background-light h-9 w-0.5' />
			<TogglePanMode checked={!isSelecting} onChange={onClickPanMode} />
			<ToggleSelectionMode checked={isSelecting} onChange={onClickSelectionMode} />
			<ToggleExpandAll />
			<div className='bg-background-light h-9 w-0.5' />
			<DeleteIssuesDialog nodes={selectedNodes} />
			<ChangeIssueType />
			<div className='bg-background-light h-9 w-0.5' />
			<CreateIssues />
			{hasValidationErrors && (
				<>
					<div className='bg-background-light h-9 w-0.5' />
					<InfluenceDiagramValidation />
				</>
			)}
		</div>
	);
};

type ToolBarProps = {
	onClickPanMode: () => void;
	onClickSelectionMode: () => void;
};
