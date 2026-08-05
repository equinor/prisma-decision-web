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
	IssueCardStates,
} from '../../common/Cards/IssueCard';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const DecisionNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const selectedOption = issue?.decision.options.find(o => evidence.includes(o.id));

	if (!issue) return null;

	return (
		<InfluenceNodeShell inProgress={inProgress} isTarget={isTarget}>
			<IssueCard
				issue={issue}
				selected={selected}
				includeBorder
				selectedState={selectedOption}
				isHighlighted={!!data.isHighlighted}
				onClickState={option => {
					toggleEvidence(option.id, issue.id);
				}}
			>
				<IssueCardHeader>
					<IssueCardMenu>
						<IssueCardEditMenuItem />
						<IssueCardDeleteMenuItem />
					</IssueCardMenu>
				</IssueCardHeader>
				<IssueCardExpandableContent />
				<IssueCardStates>
					<IssueCardExpandTrigger />
				</IssueCardStates>
			</IssueCard>
		</InfluenceNodeShell>
	);
};
