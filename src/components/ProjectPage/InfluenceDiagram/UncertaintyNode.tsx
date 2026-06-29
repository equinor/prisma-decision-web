import { NodeProps } from '@xyflow/react';
import { useState } from 'react';
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
	IssueCardProbabilityTableMenuItem,
	IssueCardStates,
} from '../../common/Cards/IssueCard';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { ProbabilityTable } from './ProbabilityTable/ProbabilityTable';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const UncertaintyNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const [probabilityTableOpen, setProbabilityTableOpen] = useState(false);
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const selectedOutcome = issue?.uncertainty.outcomes.find(o => evidence.includes(o.id));

	if (!issue) return null;

	return (
		<div className='flex flex-col gap-1'>
			<InfluenceNodeShell
				inProgress={inProgress}
				isTarget={isTarget}
				expandWidth={probabilityTableOpen}
			>
				<IssueCard
					selected={selected}
					includeBorder
					isHighlighted={!!data.isHighlighted}
					issue={issue}
					selectedState={selectedOutcome}
					onClickState={option => {
						toggleEvidence(option.id, issue.id);
					}}
				>
					<IssueCardHeader>
						<IssueCardMenu>
							<IssueCardEditMenuItem />
							<IssueCardDeleteMenuItem />
							<IssueCardProbabilityTableMenuItem
								onClick={() => setProbabilityTableOpen(true)}
							/>
						</IssueCardMenu>
					</IssueCardHeader>
					<IssueCardExpandableContent />
					<IssueCardStates>
						<IssueCardExpandTrigger />
					</IssueCardStates>
				</IssueCard>
			</InfluenceNodeShell>
			{probabilityTableOpen && (
				<ProbabilityTable
					issue={issue}
					selected={selected}
					onClose={setProbabilityTableOpen}
				/>
			)}
		</div>
	);
};
