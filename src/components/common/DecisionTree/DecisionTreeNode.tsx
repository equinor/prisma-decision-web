import { Fragment } from 'react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useAtom } from 'jotai';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { Issue } from '../../../validators';
import { DecisionCard } from '../Cards/DecisionCard';
import { UncertaintyCard } from '../Cards/UncertaintyCard';
import { testAtom } from '../../ProjectPage/DecisionTree/useDecisionTree';

const handlePositions = [Position.Left, Position.Right];

export const DecisionTreeNode = ({
	data,
	id,
}: NodeProps<Node<{ issue: Issue; path: Set<string> }>>) => {
	const IssueCard = data.issue.type === 'Decision' ? DecisionCard : UncertaintyCard;
	const [selectedNodes, setSelectedNodes] = useAtom(testAtom);
	const selected = selectedNodes.has(id) || (data.path.size === 0 && selectedNodes.size > 0);
	return (
		<div
			onClick={() => {
				setSelectedNodes(new Set(data.path));
			}}
		>
			{handlePositions.map(position => (
				<Fragment key={`${id}-${position}`}>
					<Handle
						type='source'
						position={position}
						id={position}
						className='bg-primary-resting! z-1 h-3! w-3!'
						isConnectable={false}
					/>
					<Handle
						type='target'
						position={position}
						id={position}
						className='bg-primary-resting! z-1 h-3! w-3!'
						isConnectable={false}
					/>
				</Fragment>
			))}
			<div
				className={`h-full max-w-87.5
				overflow-hidden rounded-sm border-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
			>
				<IssueCard
					canExpand={false}
					issue={data.issue}
					className={`h-20 w-full overflow-hidden rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
				/>
			</div>
		</div>
	);
};
