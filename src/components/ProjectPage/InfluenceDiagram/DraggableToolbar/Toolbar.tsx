import { useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNodes, useStore } from '@xyflow/react';
import { useHasInfluenceDiagramError } from '../../../../hooks/useHasInfluenceDiagramError';
import { dragHandle } from '../../../../icons';
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
import { TogglePanMode } from './TogglePanMode';
import { ToggleSelectionMode } from './ToggleSelectionMode';
import { SolutionEvidenceResponse } from '../../../../validators';
import { useInfluenceDiagramEvidence } from '../../../../hooks/useInfluenceDiagramEvidence';

export const Toolbar = ({ onClickPanMode, onClickSelectionMode }: ToolBarProps) => {
	const [toolBarPosition] = useLocalStorage('toolbar-position', 'top');
	const { ref, handleRef } = useDraggable({
		id: 'toolbar',
	});
	const { hasError: hasInfluenceDiagramError } = useHasInfluenceDiagramError();
	const isSelecting = useStore(state => state.selectNodesOnDrag);
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const selectedNodes = nodes.filter(node => node.selected);
	const projectId = nodes.find(n => n.data.project_id)?.data.project_id;
	const { evidence } = useInfluenceDiagramEvidence();
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
			<LayoutControls />
			<div className='bg-background-light h-9 w-0.5' />
			<TogglePanMode checked={!isSelecting} onChange={onClickPanMode} />
			<ToggleSelectionMode checked={isSelecting} onChange={onClickSelectionMode} />
			<ToggleExpandAll />
			<div className='bg-background-light h-9 w-0.5' />
			<DeleteIssuesDialog nodes={selectedNodes} />
			<ChangeIssueType />
			<CreateIssues />
			{hasInfluenceDiagramError && (
				<>
					<div className='bg-background-light h-9 w-0.5' />
					<InfluenceDiagramValidation />
				</>
			)}
			{selectedEvidence.length > 0 && (
				<>
					<div className='bg-background-light h-9 w-0.5' />
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
