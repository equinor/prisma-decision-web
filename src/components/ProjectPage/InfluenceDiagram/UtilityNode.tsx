import { NodeProps, useEdges } from '@xyflow/react';
import { useState } from 'react';
import { ReactFlowInfluenceNode } from '../../../types';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { UtilityCard } from '../../common/Cards/UtilityCard';
import { UtilityTable } from './UtilityTable/UtilityTable';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const UtilityNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const edges = useEdges();
	const hasTwoOrMoreParents = edges.filter(edge => edge.target === data.id).length >= 2;
	const [utilityTableOpen, setUtilityTableOpen] = useState(false);
	if (!issue) return null;

	return (
		<InfluenceNodeShell
			issueType={issue.type}
			selected={selected}
			isHighlighted={data.isHighlighted}
			inProgress={inProgress}
			isTarget={isTarget}
			expandWidth={utilityTableOpen}
			content={
				<UtilityCard
					className='min-h-34'
					issue={issue}
					hasTwoOrMoreParents={hasTwoOrMoreParents}
					onClickOpenUtilityTable={() => setUtilityTableOpen(true)}
				/>
			}
			modal={
				utilityTableOpen && (
					<UtilityTable issue={issue} selected={selected} onClose={setUtilityTableOpen} />
				)
			}
		/>
	);
};
