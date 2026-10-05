import { Handle, Position, useNodeId } from '@xyflow/react';
import { ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { NodeConnector } from './NodeConnector';

type InfluenceNodeShellProps = {
	inProgress: boolean;
	isTarget: boolean;
	children: ReactNode;
	expandWidth?: boolean;
	canStartConnection?: boolean;
	className?: string;
	// Uses a hover connector instead of a full-size source handle so the node body can be dragged
	useConnector?: boolean;
};

export const InfluenceNodeShell = ({
	inProgress,
	isTarget,
	children,
	expandWidth,
	canStartConnection = true,
	className,
	useConnector = false,
}: InfluenceNodeShellProps) => {
	const nodeId = useNodeId();
	return (
		<div
			className={cn(
				`group/node pointer-events-none relative z-10 h-full w-87.5
				overflow-visible rounded-sm [&_button]:pointer-events-auto [&_li]:pointer-events-auto`,
				{
					'w-auto': expandWidth,
					'pointer-events-auto h-auto w-auto': useConnector,
				},
				className,
			)}
		>
			{nodeId && (
				<NodeConnector
					nodeId={nodeId}
					canStartConnection={canStartConnection}
					hidden={inProgress}
					handleId={useConnector ? 'node-source' : 'node-source-connector'}
				/>
			)}
			{!useConnector && !inProgress && (
				<Handle
					type='source'
					position={Position.Right}
					id='node-source'
					isConnectableStart={canStartConnection}
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
				{children}
			</div>
		</div>
	);
};
