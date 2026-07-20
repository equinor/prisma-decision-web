import { NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { ReactFlowInfluenceNode } from '../../../types';
import { UncertaintyCard } from '../../common/Cards/UncertaintyCard';
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
		<InfluenceNodeShell
			issueType={issue.type}
			selected={selected}
			isHighlighted={data.isHighlighted}
			inProgress={inProgress}
			isTarget={isTarget}
			expandWidth={probabilityTableOpen}
			content={
				<UncertaintyCard
					issue={issue}
					disableZeroProbabilityOutcomes
					onClickOutcome={outcome => {
						toggleEvidence(outcome.id, issue.id);
					}}
					selectedOutcome={selectedOutcome}
					onClickOpenProbabilities={() => setProbabilityTableOpen(true)}
				/>
			}
			modal={
				probabilityTableOpen && (
					<ProbabilityTable
						issue={issue}
						selected={selected}
						onClose={setProbabilityTableOpen}
					/>
				)
			}
		/>
	);
};
