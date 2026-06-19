import { NodeProps, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { ReactFlowInfluenceNode } from '../../../types';
import { DecisionCard } from '../../common/Cards/DecisionCard';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { ProbabilityTable } from './ProbabilityTable/ProbabilityTable';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const DecisionNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const [probabilityTableOpen, setProbabilityTableOpen] = useState(false);
	const { updateNodeData } = useReactFlow();
	const selectedOption = issue?.decision.options.find(o => o.id === data.selectedOptionId);
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
					onClickOption={option => {
						if (option.id === data.selectedOptionId) {
							updateNodeData(id, { selectedOptionId: undefined });
							return;
						}
						updateNodeData(id, { selectedOptionId: option.id });
					}}
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
