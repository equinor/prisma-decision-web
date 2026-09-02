import { Icon } from '@equinor/eds-core-react';
import { warning_outlined } from '@equinor/eds-icons';
import { NodeProps, useEdges } from '@xyflow/react';
import { useState } from 'react';
import { ReactFlowInfluenceNode } from '../../../types';
import {
	IssueCard,
	IssueCardContent,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardHeader,
	IssueCardMenu,
	IssueCardUtilityTableMenuItem,
} from '../../common/Cards/IssueCard';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { UtilityTable } from './UtilityTable/UtilityTable';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

export const UtilityNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const edges = useEdges();
	const hasTwoOrMoreParents = edges.filter(edge => edge.target === data.id).length >= 2;
	const [utilityTableOpen, setUtilityTableOpen] = useState(false);
	if (!issue) return null;

	return (
		<div className='flex flex-col gap-1'>
			<InfluenceNodeShell
				inProgress={inProgress}
				isTarget={isTarget}
				expandWidth={utilityTableOpen}
				canStartConnection={false}
			>
				<IssueCard issue={issue} className='min-h-35!' selected={selected} includeBorder>
					<IssueCardHeader>
						<IssueCardMenu>
							<IssueCardEditMenuItem />
							<IssueCardDeleteMenuItem />
							<IssueCardUtilityTableMenuItem
								onClick={() => setUtilityTableOpen(true)}
								disabled={!hasTwoOrMoreParents}
							/>
						</IssueCardMenu>
					</IssueCardHeader>
					<IssueCardContent descriptionClassName='line-clamp-2' />
				</IssueCard>
			</InfluenceNodeShell>
			{!hasTwoOrMoreParents && (
				<div className='absolute -top-7 flex gap-1.5'>
					<Icon className='fill-warning-resting' data={warning_outlined} />
					<p className='text-warning-resting'>
						Connect 2+ parent nodes to enable utility table and solver
					</p>
				</div>
			)}
			{utilityTableOpen && (
				<UtilityTable issue={issue} selected={selected} onClose={setUtilityTableOpen} />
			)}
		</div>
	);
};
