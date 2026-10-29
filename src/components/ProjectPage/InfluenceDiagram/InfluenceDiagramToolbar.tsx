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
import {
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarToolButton,
	ToolbarToolGroup,
} from '../../common/DraggableToolbar/Toolbar';
import { Icon } from '@equinor/eds-core-react/next';
import { category, credit_card, pan_tool, select_all } from '@equinor/eds-icons';
import { InfluenceDiagramView } from './useInfluenceDiagramView';

export type InfluenceDiagramTool = 'pan' | 'selection';

export const InfluenceDiagramToolbar = ({
	view,
	onViewChange,
	tool,
	onToolChange,
}: {
	view: InfluenceDiagramView;
	onViewChange: (view: InfluenceDiagramView) => void;
	tool: InfluenceDiagramTool;
	onToolChange: (tool: InfluenceDiagramTool) => void;
}) => {
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const selectedNodes = nodes.filter(node => node.selected);

	return (
		<DraggableToolbar aria-label='Influence diagram toolbar'>
			<ToolbarToolGroup
				aria-label='Diagram view'
				className='gap-0 rounded-sm border border-(--eds-color-border-subtle) p-0.5'
			>
				<ToolbarToolButton
					icon
					tone='neutral'
					tooltip='Card view'
					selected={view === 'card'}
					onClick={() => onViewChange('card')}
					className='size-7! min-h-7!'
				>
					<Icon data={credit_card} size='md' />
				</ToolbarToolButton>
				<ToolbarToolButton
					icon
					tone='neutral'
					tooltip='Shape view'
					selected={view === 'shape'}
					onClick={() => onViewChange('shape')}
					className='size-7! min-h-7!'
				>
					<Icon data={category} size='md' />
				</ToolbarToolButton>
			</ToolbarToolGroup>
			<ToolbarSeparator />
			<ToolbarGroup aria-label='Viewport controls'>
				<ZoomControls />
				<LayoutControls />
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup aria-label='Diagram controls'>
				<ToggleExpandAll toolbar />
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarToolGroup aria-label='Tool modes'>
				<ToolbarToolButton
					icon
					tooltip='Pan mode'
					selected={tool === 'pan'}
					onClick={() => onToolChange('pan')}
				>
					<Icon data={pan_tool} size='md' />
				</ToolbarToolButton>
				<ToolbarToolButton
					icon
					tooltip='Selection mode'
					selected={tool === 'selection'}
					onClick={() => onToolChange('selection')}
				>
					<Icon data={select_all} size='md' />
				</ToolbarToolButton>
			</ToolbarToolGroup>
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
