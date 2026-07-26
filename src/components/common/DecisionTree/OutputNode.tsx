import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useLocation } from 'react-router';
import { useSelectedDecisionTreePath } from '../../../hooks/useSelectedDecisionTreePath';
import { IncomingStateDetails } from './IncomingStateDetails';
import { DecisionTreeOutputNodeData } from './types';

export const OutputNode = ({ data }: NodeProps<Node<DecisionTreeOutputNodeData>>) => {
	const location = useLocation();
	const treeType = location.pathname.includes('solution') ? 'solution' : 'decision';
	const { selectPath } = useSelectedDecisionTreePath(treeType);
	return (
		<div
			onClick={() => selectPath(data.statePath.length > 0 ? data.statePath : null)}
			className='pan bg-background-light border-background-medium dark:border-primary-resting/30 h-25 min-w-72 overflow-hidden rounded-sm border-2'
		>
			<Handle
				type='target'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3! opacity-0'
			/>
			<div className='grid h-full grid-cols-[auto_1fr]'>
				<IncomingStateDetails
					incomingState={data.incomingState}
					className='border-background-medium dark:border-primary-resting/30 w-28 shrink-0 border-r-2 '
				/>
				<div className='bg-background-default flex flex-1 items-center gap-3 px-3'>
					<div>
						<p className='whitespace-nowrap'>
							<span className='font-semibold'>Value: </span> {data.value}
						</p>
						<p className='whitespace-nowrap'>
							<span className='font-semibold'>Cumulative probability: </span>{' '}
							{parseFloat(data.cumulativeProbability.toFixed(2))}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
