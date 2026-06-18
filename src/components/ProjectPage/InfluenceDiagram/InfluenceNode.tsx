import { Handle, Node, NodeProps, Position, useConnection, useEdges } from '@xyflow/react';
import { useState } from 'react';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { cn } from '../../../utils/cn';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { InfluenceNode as InfluenceNodeType } from '../../../validators';
import { DecisionCard } from '../../common/Cards/DecisionCard';
import { FactCard } from '../../common/Cards/FactCard';
import { UnassignedCard } from '../../common/Cards/UnassignedCard';
import { UncertaintyCard } from '../../common/Cards/UncertaintyCard';
import { UtilityCard } from '../../common/Cards/UtilityCard';
import { ProbabilityTable } from './ProbabilityTable/ProbabilityTable';
import { UtilityTable } from './UtilityTable/UtilityTable';

export const InfluenceNode = ({ id, data, selected }: NodeProps<Node<InfluenceNodeType>>) => {
	const issue = useSelectedProjectIssues().find(issue => issue.id === data.issue_id);
	const edges = useEdges();
	const { inProgress, isTarget } = useConnection<
		Node<InfluenceNodeType>,
		{ inProgress: boolean; isTarget: boolean }
	>(connection => ({
		inProgress: connection.inProgress,
		isTarget: connection.inProgress && connection.fromNode?.id !== id,
	}));
	const hasTwoOrMoreParents = edges.filter(edge => edge.target === data.id).length >= 2;
	const [probabilityTableOpen, setProbabilityTableOpen] = useState(false);
	const [utilityTableOpen, setUtilityTableOpen] = useState(false);
	if (!issue) return null;
	return (
		<div
			className={cn('flex w-87.5 flex-col gap-2', {
				'w-auto': probabilityTableOpen || utilityTableOpen,
			})}
		>
			<div
				className={cn(
					`pointer-events-none relative z-10 flex h-full flex-col gap-2 overflow-hidden
					rounded-sm border-2 [&_button]:pointer-events-auto [&_li]:pointer-events-auto`,
					getDiagramIssueBorderColor(issue.type, selected),
					{
						'border-[#FF9200]': data.isHighlighted,
					},
				)}
			>
				{!inProgress && (
					<Handle
						type='source'
						position={Position.Right}
						id='node-source'
						className='top-0! left-0! h-full! w-full! -translate-x-1/2! translate-y-1/2!
						rounded-none! border-none! bg-transparent! opacity-0!'
					/>
				)}
				{(!inProgress || isTarget) && (
					<Handle
						type='target'
						position={Position.Left}
						id='node-target'
						isConnectableStart={false}
						className='top-0! left-0! h-full! w-full! translate-x-1/2! translate-y-1/2!
						rounded-none! border-none! bg-transparent! opacity-0!'
					/>
				)}
				<div
					className={cn({
						'pointer-events-none [&_button]:pointer-events-none! [&_li]:pointer-events-none!':
							inProgress,
					})}
				>
					{issue.type === 'Fact' && <FactCard issue={issue} />}
					{issue.type === 'Unassigned' && <UnassignedCard issue={issue} />}
					{issue.type === 'Decision' && <DecisionCard issue={issue} />}
					{issue.type === 'Utility' && (
						<UtilityCard
							className='min-h-34'
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
		</div>
	);
};
