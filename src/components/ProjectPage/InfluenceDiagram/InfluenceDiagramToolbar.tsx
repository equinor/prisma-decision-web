import { useNodes } from '@xyflow/react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { ReactFlowInfluenceNode } from '../../../types';
import { SolutionEvidenceResponse } from '../../../validators';
import { CreateIssues } from '../../common/CreateIssue';
import { EVMetrics } from '../../common/EVMetrics';
import { useSelectedProject } from '../ProjectContext';
import { ToggleExpandAll } from '../ToggleExpandAll';
import { ZoomControls } from '../../common/DraggableToolbar/ZoomControls';
import { InfluenceDiagramValidation } from './InfluenceDiagramValidation';
import { ChangeIssueType } from '../../common/DraggableToolbar/ChangeIssueType';
import { DeleteMenu } from '../../common/DraggableToolbar/DeleteMenu';
import { LayoutControls } from '../../common/DraggableToolbar/LayoutControls';
import {
	ToolBar,
	ToolbarDragDropProvider,
	ToolbarSeparator,
} from '../../common/DraggableToolbar/Toolbar';

export const InfluenceDiagramToolbar = () => {
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const selectedNodes = nodes.filter(node => node.selected);

	return (
		<ToolbarDragDropProvider>
			<ToolBar>
				<ZoomControls />
				<LayoutControls />
				<ToolbarSeparator />
				<ToggleExpandAll />
				<ToolbarSeparator />
				<DeleteMenu selectedNodes={selectedNodes} />
				<ChangeIssueType />
				<CreateIssues />
				<InfluenceDiagramValidation />
				<ToolbarSeparator />
				<BarMetrics />
			</ToolBar>
		</ToolbarDragDropProvider>
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
