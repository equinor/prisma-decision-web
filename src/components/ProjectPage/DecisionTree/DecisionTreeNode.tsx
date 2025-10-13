import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useAtom } from 'jotai';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { getIssueCardType } from '../../../utils/getIssueCardType';
import { Issue } from '../../../validators';
import { testAtom } from './useDecisionTree';

const handlePositions = [Position.Left, Position.Right];

export const DecisionTreeNode = ({
	data,
	id,
}: NodeProps<Node<{ issue: Issue; path: Set<string> }>>) => {
	const IssueCard = getIssueCardType(data.issue.type);
	const [selectedNodes, setSelectedNodes] = useAtom(testAtom);
	const selected = selectedNodes.has(id) || (data.path.size === 0 && selectedNodes.size > 0);
	return (
		<div
			onClick={() => {
				setSelectedNodes(new Set(data.path));
			}}
		>
			{handlePositions.map(position => (
				<>
					<Handle
						key={`source-${position}`}
						type='source'
						position={position}
						id={position}
						className='bg-primary-resting! z-1 h-3! w-3!'
						isConnectable={false}
					/>
					<Handle
						key={`target-${position}`}
						type='target'
						position={position}
						id={position}
						className='bg-primary-resting! z-1 h-3! w-3!'
						isConnectable={false}
					/>
				</>
			))}
			<IssueCard
				issue={data.issue}
				className={`h-full w-full overflow-hidden rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
			/>
		</div>
	);
};
