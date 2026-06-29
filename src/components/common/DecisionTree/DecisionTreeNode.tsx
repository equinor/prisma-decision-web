import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { Fragment } from 'react';
import { useLocation } from 'react-router';
import { isDecisionPathSelected } from '../../../hooks/useExpandedTreeNodes';
import { useSelectedDecisionTreePath } from '../../../hooks/useSelectedDecisionTreePath';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import {
	IssueCard,
	IssueCardContent,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardHeader,
	IssueCardMenu,
} from '../Cards/IssueCard';

const handlePositions = [Position.Left, Position.Right];

export const DecisionTreeNode = ({
	data,
	id,
}: NodeProps<Node<{ issueId: string; statePath?: string[]; expectedValue?: number | null }>>) => {
	const location = useLocation();
	const treeType = location.pathname.includes('solution') ? 'solution' : 'decision';
	const issues = useSelectedProjectIssues();
	const issue = issues.find(issue => issue.id === data.issueId);
	const { selectedPath, selectPath } = useSelectedDecisionTreePath(treeType);
	const statePath = data.statePath || [];
	const selected = isDecisionPathSelected(selectedPath, statePath);
	if (!issue) return null;
	return (
		<>
			<div
				onClick={() => {
					selectPath(statePath.length > 0 ? statePath : null);
				}}
			>
				{handlePositions.map(position => (
					<Fragment key={`${id}-${position}`}>
						<Handle
							type='source'
							position={position}
							id={position}
							className='bg-primary-resting! z-1 mr-1.5! h-3! w-3! opacity-0!'
							isConnectable={false}
						/>
						<Handle
							type='target'
							position={position}
							id={position}
							className='bg-primary-resting! z-1 h-3! w-3! opacity-0!'
							isConnectable={false}
						/>
					</Fragment>
				))}
				<div className='h-full max-w-87.5 overflow-hidden'>
					<IssueCard issue={issue} className={'h-20'} includeBorder selected={selected}>
						<IssueCardHeader>
							<IssueCardMenu>
								<IssueCardEditMenuItem />
								<IssueCardDeleteMenuItem />
							</IssueCardMenu>
						</IssueCardHeader>
						<IssueCardContent />
					</IssueCard>
				</div>
			</div>
			{!!data.expectedValue && (
				<div className='absolute top-1/2 -right-3 translate-x-full -translate-y-full '>
					<p>
						<span className='font-semibold'>EV: </span>
						{parseFloat(data.expectedValue?.toFixed(3) || '0')}
					</p>
				</div>
			)}
		</>
	);
};
