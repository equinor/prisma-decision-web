import { useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNodes } from '@xyflow/react';
import { useInfluenceDiagramEvidence } from '../../../../hooks/useInfluenceDiagramEvidence';
import { dragHandle } from '../../../../icons';
import { ReactFlowInfluenceNode } from '../../../../types';
import { cn } from '../../../../utils/cn';
import { SolutionEvidenceResponse } from '../../../../validators';
import { CreateIssues } from '../../../common/CreateIssue';
import { EVMetrics } from '../../../common/EVMetrics';
import { ToggleExpandAll } from '../../ToggleExpandAll';
import { ZoomControls } from '../../ZoomControls';
import { InfluenceDiagramValidation } from '../InfluenceDiagramValidation';
import { ChangeIssueType } from './ChangeIssueType';
import { DeleteMenu } from './DeleteMenu';
import { LayoutControls } from './LayoutControls';

export const Toolbar = () => {
	const [toolBarPosition] = useLocalStorage('toolbar-position', 'top');
	const { ref, handleRef } = useDraggable({
		id: 'toolbar',
	});
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
			<ToggleExpandAll />
			<div className='bg-background-light h-9 w-0.5' />
			<DeleteMenu selectedNodes={selectedNodes} />
			<ChangeIssueType />
			<CreateIssues />
			<InfluenceDiagramValidation />
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
