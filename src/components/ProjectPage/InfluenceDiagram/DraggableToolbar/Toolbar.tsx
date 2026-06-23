import { useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNodes, useStore } from '@xyflow/react';
import { useHasInfluenceDiagramError } from '../../../../hooks/useHasInfluenceDiagramError';
import { useGetExpectedValue } from '../../../../hooks/api/useGetExpectedValue';
import { dragHandle } from '../../../../icons';
import { ReactFlowInfluenceNode } from '../../../../types';
import { cn } from '../../../../utils/cn';
import { CreateIssues } from '../../../common/CreateIssue';
import { DeleteIssuesDialog } from '../../../common/DeleteIssuesDialog';
import { ToggleExpandAll } from '../../ToggleExpandAll';
import { ZoomControls } from '../../ZoomControls';
import { InfluenceDiagramValidation } from '../InfluenceDiagramValidation';
import { ChangeIssueType } from './ChangeIssueType';
import { LayoutControls } from './LayoutControls';
import { TogglePanMode } from './TogglePanMode';
import { ToggleSelectionMode } from './ToggleSelectionMode';
import { SolutionEvidenceRequest } from '../../../../validators';
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

	const baseEvidence: SolutionEvidenceRequest[] = [
		{
			evidence_id: projectId ?? 'base-ev',
			state_ids: [],
		},
	];
	const selectedEvidence: SolutionEvidenceRequest[] = [
		{
			evidence_id: projectId ?? 'selected-ev',
			state_ids: evidence,
		},
	];
	const { data: baseEvidenceData, isPending: isBaseEvPending } = useGetExpectedValue(
		baseEvidence,
		projectId,
		true,
	);
	const { data: selectedEvidenceData, isPending: isSelectedEvPending } = useGetExpectedValue(
		selectedEvidence,
		projectId,
	);
	const baseExpectedUtility = baseEvidenceData?.[0]?.expected_utility;
	const selectedExpectedUtility = selectedEvidenceData?.[0]?.expected_utility;
	const hasSelectedStateIds = evidence.length > 0;
	const evDelta =
		baseExpectedUtility !== undefined && selectedExpectedUtility !== undefined
			? selectedExpectedUtility - baseExpectedUtility
			: undefined;

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
			{baseExpectedUtility !== undefined && (
				<>
					<div className='bg-background-light h-9 w-0.5' />
					<div className='flex items-center gap-3 px-1'>
						<div className='flex flex-col items-start justify-center'>
							<p className='text-text-tertiary text-[10px] uppercase'>Base EV</p>
							<p className='text-sm font-medium'>
								{isBaseEvPending ? '…' : baseExpectedUtility.toFixed(2)}
							</p>
						</div>
						<div className='bg-background-light h-7 w-px' />
						<div className='flex flex-col items-start justify-center'>
							<p className='text-text-tertiary text-[10px] uppercase'>Scenario EV</p>
							<p className='text-sm font-medium'>
								{!hasSelectedStateIds
									? 'Select states'
									: isSelectedEvPending
										? '…'
										: (selectedExpectedUtility?.toFixed(2) ?? '—')}
							</p>
						</div>
						{evDelta !== undefined && (
							<div
								className={cn(
									'bg-background-light rounded-sm px-2 py-1 text-xs font-medium',
									{
										'text-[#0A7D33]': evDelta > 0,
										'text-[#B42318]': evDelta < 0,
										'text-text-tertiary': evDelta === 0,
									},
								)}
							>
								Δ {evDelta > 0 ? '+' : ''}
								{evDelta.toFixed(2)}
							</div>
						)}
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
