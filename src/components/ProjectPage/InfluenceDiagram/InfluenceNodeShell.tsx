import { Handle, Position } from '@xyflow/react';
import { ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { IssueType } from '../../../validators';

type InfluenceNodeShellProps = {
	issueType: IssueType;
	selected: boolean;
	isHighlighted?: string;
	inProgress: boolean;
	isTarget: boolean;
	expandWidth?: boolean;
	content: ReactNode;
	modal?: ReactNode;
};

export const InfluenceNodeShell = ({
	issueType,
	selected,
	isHighlighted,
	inProgress,
	isTarget,
	expandWidth,
	content,
	modal,
}: InfluenceNodeShellProps) => {
	return (
		<div
			className={cn('flex w-87.5 flex-col gap-2', {
				'w-auto': expandWidth,
			})}
		>
			<div
				className={cn(
					`pointer-events-none relative z-10 flex h-full flex-col gap-2 overflow-visible
					rounded-sm border-2 [&_button]:pointer-events-auto [&_li]:pointer-events-auto`,
					getDiagramIssueBorderColor(issueType, selected),
					{
						'border-[#FF9200]': isHighlighted,
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
					{content}
				</div>
			</div>
			{modal}
		</div>
	);
};
