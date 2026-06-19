import { NodeProps, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { ReactFlowInfluenceNode } from '../../../types';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { ProbabilityTable } from './ProbabilityTable/ProbabilityTable';
import { UncertaintyCard } from '../../common/Cards/UncertaintyCard';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const UncertaintyNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget, hasValidationError } = useInfluenceNodeCommon(
		id,
		data.issue_id,
	);
	const [probabilityTableOpen, setProbabilityTableOpen] = useState(false);
	const { updateNodeData } = useReactFlow();
	const selectedOutcome = issue?.uncertainty.outcomes.find(o => o.id === data.selectedOutcomeId);

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
					onClickOutcome={
						hasValidationError
							? undefined
							: outcome => {
									if (outcome.id === data.selectedOutcomeId) {
										updateNodeData(id, { selectedOutcomeId: undefined });
										return;
									}
									updateNodeData(id, { selectedOutcomeId: outcome.id });
								}
					}
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
