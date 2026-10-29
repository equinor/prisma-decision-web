import { Menu } from '@equinor/eds-core-react';
import { Badge, Icon } from '@equinor/eds-core-react/next';
import { add, radio_button_unselected } from '@equinor/eds-icons';
import { Handle, Position, useConnection, useNodes, useStore } from '@xyflow/react';
import { useState } from 'react';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../../../../types';
import { issueTypeTones } from '../../../../utils/issueTypeTones';
import { IssueTypeIcon } from '../../../common/IssueTypeIcon';

export const ShapeArcHandle = ({ nodeId }: { nodeId: string }) => {
	const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
	const [open, setOpen] = useState(false);
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const issues = useSelectedProjectIssues();
	const inProgress = useConnection(connection => connection.inProgress);
	const onConnect = useStore(state => state.onConnect);
	const isValidConnection = useStore(state => state.isValidConnection);
	const openOnRelease = () => {
		// React Flow ends its mouse/touch connection after this Handle's release.
		if (!inProgress) setOpen(true);
	};
	const targets = nodes.flatMap(node => {
		const issue = issues.find(issue => issue.id === node.data.issue_id);
		const connection = {
			source: nodeId,
			sourceHandle: 'node-source',
			target: node.id,
			targetHandle: 'node-target',
		};
		return !node.hidden && issue && (isValidConnection?.(connection) ?? true)
			? [{ connection, issue }]
			: [];
	});

	return (
		<>
			<Handle
				ref={setAnchorEl}
				type='source'
				id='node-source'
				position={Position.Right}
				role='button'
				tabIndex={0}
				aria-label='Add arc'
				aria-haspopup='menu'
				aria-expanded={open}
				className='influence-shape-control group/arc top-1/2! right-auto! left-full! flex size-11! -translate-y-1/2 transform-none! items-center justify-center rounded-none! border-0! bg-transparent!'
				onMouseDown={() => setOpen(false)}
				onTouchStart={() => setOpen(false)}
				onMouseUp={openOnRelease}
				onTouchEnd={openOnRelease}
				onClick={event => {
					event.stopPropagation();
					if (!event.detail) setOpen(true);
				}}
				onKeyDown={event => {
					event.stopPropagation();
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						setOpen(true);
					}
				}}
			>
				<span
					data-open={open}
					className='pointer-events-none flex size-7 items-center justify-center rounded-full border border-transparent bg-(--eds-color-bg-floating) text-(--eds-color-text-accent-subtle) shadow-md group-hover/arc:border-(--eds-color-border-accent-strong) group-hover/arc:bg-(--eds-color-bg-accent-fill-muted-default) data-[open=true]:border-(--eds-color-border-accent-strong) data-[open=true]:bg-(--eds-color-bg-accent-fill-muted-default)'
				>
					<Icon
						data={radio_button_unselected}
						size='sm'
						className={open ? 'hidden' : 'group-hover/arc:hidden'}
					/>
					<Icon
						data={add}
						size='sm'
						className={open ? '' : 'hidden group-hover/arc:block'}
					/>
				</span>
			</Handle>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setOpen(false)}
				placement='right-start'
				aria-label='Add arc to'
				className='nodrag nopan nowheel max-h-[calc(100dvh-1rem)]! w-60! overflow-y-auto'
				onClick={event => event.stopPropagation()}
			>
				{open && (
					<Menu.Section title='Add arc to'>
						{targets.length ? (
							targets.map(({ connection, issue }) => (
								<Menu.Item
									key={connection.target}
									aria-label={`${issue.type} ${issue.name}`}
									className='[&>div]:gap-2!'
									onClick={() => onConnect?.(connection)}
								>
									<Badge
										aria-hidden
										tone={issueTypeTones[issue.type]}
										emphasis='medium'
										className='h-7! w-9! justify-center rounded-full! px-2! text-(--eds-color-text-neutral-subtle)! [&_.eds-icon]:size-5!'
									>
										<IssueTypeIcon type={issue.type} />
									</Badge>
									<span className='min-w-0 [overflow-wrap:anywhere]'>
										{issue.name}
									</span>
								</Menu.Item>
							))
						) : (
							<Menu.Item disabled>No available nodes</Menu.Item>
						)}
					</Menu.Section>
				)}
			</Menu>
		</>
	);
};
