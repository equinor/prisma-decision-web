import { useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { drag_indicator } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNodes, useStore } from '@xyflow/react';
import { ReactFlowInfluenceNode } from '../../../../types';
import { cn } from '../../../../utils/cn';
import { CreateIssues } from '../../../common/CreateIssue';
import { DeleteIssuesDialog } from '../../../common/DeleteIssuesDialog';
import { EVMetrics } from '../../../common/EVMetrics';
import { ToggleExpandAll } from '../../ToggleExpandAll';
import { ZoomControls } from '../../ZoomControls';
import { InfluenceDiagramValidation } from '../InfluenceDiagramValidation';
import { ChangeIssueType } from './ChangeIssueType';
import { LayoutControls } from './LayoutControls';
import { ResetLayout } from './ResetLayout';
import { ToggleNodeView } from './ToggleNodeView';
import { TogglePanMode } from './TogglePanMode';
import { ToggleSelectionMode } from './ToggleSelectionMode';
import { SolutionEvidenceResponse } from '../../../../validators';
import { useInfluenceDiagramEvidence } from '../../../../hooks/useInfluenceDiagramEvidence';
import { useInfluenceDiagramNodeView } from '../../../../hooks/useInfluenceDiagramNodeView';

export const Toolbar = ({ onClickPanMode, onClickSelectionMode }: ToolBarProps) => {
	const [toolBarPosition] = useLocalStorage('toolbar-position', 'top');
	const { ref, handleRef } = useDraggable({
		id: 'toolbar',
	});
	const isSelecting = useStore(state => state.selectNodesOnDrag);
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const selectedNodes = nodes.filter(node => node.selected);
	const projectId = nodes.find(n => n.data.project_id)?.data.project_id;
	const { evidence } = useInfluenceDiagramEvidence();
	const [nodeView] = useInfluenceDiagramNodeView();
	const isShapeView = nodeView === 'shape';
	if (!projectId) return;
	const selectedEvidence: SolutionEvidenceResponse[] = [
		{
			evidence_id: projectId,
			state_ids: evidence,
			expected_utility: 0,
		},
	];

	return (
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
			<ToggleNodeView />
			<div className='toolbar-divider' />
			<div className='toolbar-group toolbar-view-controls'>
				<ZoomControls />
				<LayoutControls />
				{isShapeView && <ResetLayout />}
			</div>
			<div className='toolbar-divider' />
			<div className='toolbar-group'>
				<TogglePanMode checked={!isSelecting} onChange={onClickPanMode} />
				<ToggleSelectionMode checked={isSelecting} onChange={onClickSelectionMode} />
				{!isShapeView && <ToggleExpandAll />}
			</div>
			<div className='toolbar-divider' />
			<div className='toolbar-group'>
				<DeleteIssuesDialog nodes={selectedNodes} />
				<ChangeIssueType />
				<CreateIssues />
				<InfluenceDiagramValidation />
			</div>
			{selectedEvidence.length > 0 && (
				<>
					<div className='toolbar-divider' />
					<div className='flex items-center gap-3 px-1'>
						<EVMetrics selectedEvidence={selectedEvidence} />
					</div>
				</>
			)}
		</div>
	);
};

type ToolBarProps = {
	onClickPanMode: () => void;
	onClickSelectionMode: () => void;
};
