import { NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { ReactFlowInfluenceNode } from '../../../types';
import { DecisionCard } from '../../common/Cards/DecisionCard';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { PolicyTable } from './PolicyTable/PolicyTable';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const DecisionNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const [policyTableOpen, setPolicyTableOpen] = useState(false);
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
			expandWidth={policyTableOpen}
			content={
				<DecisionCard
					issue={issue}
					onClickOption={option => {
						toggleEvidence(option.id, issue.id);
					}}
					selectedOption={selectedOption}
					onClickOpenPolicyTable={() => setPolicyTableOpen(true)}
				/>
			}
			modal={
				policyTableOpen && (
					<PolicyTable issue={issue} selected={selected} onClose={setPolicyTableOpen} />
				)
			}
		/>
	);
};
