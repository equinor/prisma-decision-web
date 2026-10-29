import { useNodes } from '@xyflow/react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { ReactFlowInfluenceNode } from '../../../types';
import { SolutionEvidenceResponse } from '../../../validators';
import { CreateIssueToolbarButton } from '../../common/CreateIssueToolbarButton';
import { EVMetrics } from '../../common/EVMetrics';
import { useSelectedProject } from '../ProjectContext';
import { ToggleExpandAll } from '../ToggleExpandAll';
import { DraggableToolbar } from '../../common/DraggableToolbar/DraggableToolbar';
import { ZoomControls } from '../../common/DraggableToolbar/ZoomControls';
import { ChangeIssueType } from '../../common/DraggableToolbar/ChangeIssueType';
import { DeleteMenu } from '../../common/DraggableToolbar/DeleteMenu';
import { LayoutControls } from '../../common/DraggableToolbar/LayoutControls';
import { ToolbarGroup, ToolbarSeparator } from '../../common/DraggableToolbar/Toolbar';

export const InfluenceDiagramToolbar = () => {
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const selectedNodes = nodes.filter(node => node.selected);

	return (
		<DraggableToolbar aria-label='Influence diagram toolbar'>
			<ToolbarGroup aria-label='Viewport controls'>
				<ZoomControls />
				<LayoutControls />
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup aria-label='Diagram controls'>
				<ToggleExpandAll toolbar />
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup aria-label='Issue actions'>
				<DeleteMenu selectedNodes={selectedNodes} />
				<ChangeIssueType />
				<CreateIssueToolbarButton />
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup aria-label='Expected value metrics'>
				<BarMetrics />
			</ToolbarGroup>
		</DraggableToolbar>
	);
};

export const BarMetrics = () => {
	const { evidence } = useInfluenceDiagramEvidence();
	const { id: projectId } = useSelectedProject();
	const selectedEvidence: SolutionEvidenceResponse[] = [
		{
			evidence_id: projectId,
			state_ids: evidence,
			expected_utility: 0,
		},
	];
	if (!selectedEvidence.length) return null;
	return (
		<div className='flex items-center gap-3 px-1'>
			<EVMetrics selectedEvidence={selectedEvidence} />
		</div>
	);
};
