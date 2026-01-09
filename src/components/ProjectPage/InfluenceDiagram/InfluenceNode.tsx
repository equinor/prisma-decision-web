import { Handle, Node, NodeProps, Position, useEdges } from '@xyflow/react';
import { useState } from 'react';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { InfluenceNode as InfluenceNodeType } from '../../../validators';
import { DecisionCard } from '../../common/Cards/DecisionCard';
import { FactCard } from '../../common/Cards/FactCard';
import { UnassignedCard } from '../../common/Cards/UnassignedCard';
import { UncertaintyCard } from '../../common/Cards/UncertaintyCard';
import { ProbabilityTable } from './ProbabilityTable/ProbabilityTable';
import { UtilityCard } from '../../common/Cards/UtilityCard';
import { UtilityTable } from './UtilityTable/UtilityTable';

export const InfluenceNode = ({
	data,
	selected,
}: NodeProps<Node<{ node: InfluenceNodeType; handleClassName?: string }>>) => {
	const issue = useSelectedProjectIssues().find(issue => issue.id === data.node.issue_id);
	const edges = useEdges();
	const hasTwoOrMoreParents = edges.filter(edge => edge.target === data.node.id).length >= 2;
	const [probabilityTableOpen, setProbabilityTableOpen] = useState(false);
	const [utilityTableOpen, setUtilityTableOpen] = useState(false);
	if (!issue) return null;
	const handleClassName = data.handleClassName || 'bg-primary-resting! z-1 h-3! w-3!';

	return (
		<>
			<Handle type='source' position={Position.Top} id='top' className={handleClassName} />
			<Handle
				type='source'
				position={Position.Bottom}
				id='bottom'
				className={handleClassName}
			/>
			<Handle type='source' position={Position.Left} id='left' className={handleClassName} />
			<Handle
				type='source'
				position={Position.Right}
				id='right'
				className={handleClassName}
			/>
			<div
				className={`h-full max-w-[350px]
				overflow-hidden rounded-sm border-2 ${getDiagramIssueBorderColor(issue.type, selected)}`}
			>
				{issue.type === 'Fact' && <FactCard issue={issue} />}
				{issue.type === 'Unassigned' && <UnassignedCard issue={issue} />}
				{issue.type === 'Decision' && <DecisionCard issue={issue} />}
				{issue.type === 'Utility' && (
					<UtilityCard
						issue={issue}
						hasTwoOrMoreParents={hasTwoOrMoreParents}
						onClickOpenUtilityTable={() => setUtilityTableOpen(true)}
					/>
				)}
				{issue.type === 'Uncertainty' && (
					<UncertaintyCard
						issue={issue}
						onClickOpenProbabilities={() => setProbabilityTableOpen(true)}
					/>
				)}
			</div>
			{probabilityTableOpen && (
				<ProbabilityTable
					issue={issue}
					selected={selected}
					onClose={setProbabilityTableOpen}
				/>
			)}
			{utilityTableOpen && (
				<UtilityTable issue={issue} selected={selected} onClose={setUtilityTableOpen} />
			)}
		</>
	);
};
