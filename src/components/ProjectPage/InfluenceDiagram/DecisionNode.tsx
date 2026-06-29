import { NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { ReactFlowInfluenceNode } from '../../../types';
import { DecisionCard } from '../../common/Cards/DecisionCard';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { ProbabilityTable } from './ProbabilityTable/ProbabilityTable';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const DecisionNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget, hasValidationError } = useInfluenceNodeCommon(
		id,
		data.issue_id,
	);
	const [probabilityTableOpen, setProbabilityTableOpen] = useState(false);
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const selectedOption = issue?.decision.options.find(o => evidence.includes(o.id));

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
				<DecisionCard
					issue={issue}
					onClickOption={
						hasValidationError
							? undefined
							: option => {
									toggleEvidence(option.id, issue.id);
								}
					}
					selectedOption={selectedOption}
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
