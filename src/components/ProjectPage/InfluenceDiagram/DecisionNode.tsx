import { NodeProps } from '@xyflow/react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { ReactFlowInfluenceNode } from '../../../types';
import {
	IssueCard,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardExpandableContent,
	IssueCardExpandTrigger,
	IssueCardHeader,
	IssueCardMenu,
	IssueCardPolicyTableMenuItem,
	IssueCardStates,
} from '../../common/Cards/IssueCard';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { PolicyTable } from './PolicyTable/PolicyTable';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { Icon } from '@equinor/eds-core-react';
import { warning_outlined } from '@equinor/eds-icons';
import { useState } from 'react';

export const DecisionNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const [policyTableOpen, setPolicyTableOpen] = useState(false);
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const selectedOption = issue?.decision.options.find(o => evidence.includes(o.id));
	const {
		validationErrors: { DecisionOptions },
	} = useHasInfluenceDiagramError();
	if (!issue) return null;
	const hasMissingOptions = !!DecisionOptions.find(x => x === data.issue_id);

	return (
		<div className='flex flex-col gap-1'>
			<InfluenceNodeShell
				inProgress={inProgress}
				isTarget={isTarget}
				expandWidth={policyTableOpen}
			>
				<IssueCard
					issue={issue}
					selected={selected}
					includeBorder
					className='min-h-35!'
					selectedState={selectedOption}
					onClickState={option => {
						toggleEvidence(option.id, issue.id);
					}}
				>
					<IssueCardHeader>
						<IssueCardMenu>
							<IssueCardEditMenuItem />
							<IssueCardDeleteMenuItem />
							<IssueCardPolicyTableMenuItem
								onClick={() => setPolicyTableOpen(true)}
							/>
						</IssueCardMenu>
					</IssueCardHeader>
					<IssueCardExpandableContent />
					<IssueCardStates>
						<IssueCardExpandTrigger />
					</IssueCardStates>
				</IssueCard>
			</InfluenceNodeShell>
			{policyTableOpen && (
				<PolicyTable issue={issue} selected={selected} onClose={setPolicyTableOpen} />
			)}
			{hasMissingOptions && (
				<div className='absolute -top-7 flex  gap-1.5'>
					<Icon className='fill-warning-resting' data={warning_outlined} />
					<p className='text-warning-resting'>Has missing options</p>
				</div>
			)}
		</div>
	);
};
