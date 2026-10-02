import { Icon, Menu } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { Handle, Position, useEdges, useNodes } from '@xyflow/react';
import { useState } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../../../types';
import { cn } from '../../../utils/cn';
import { IssueType } from '../../../validators';
import { useSelectedProject } from '../ProjectContext';

type NodeConnectorProps = {
	nodeId: string;
	canStartConnection: boolean;
	hidden: boolean;
};

// Source handle shown next to a node on hover: drag to draw an arc, click to pick a target.
export const NodeConnector = ({ nodeId, canStartConnection, hidden }: NodeConnectorProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const inactive = hidden || !canStartConnection;

	return (
		<>
			<Handle
				ref={setAnchorEl}
				type='source'
				position={Position.Right}
				id='node-source'
				isConnectableStart={canStartConnection}
				onClick={event => {
					event.stopPropagation();
					if (canStartConnection) setMenuOpen(true);
				}}
				className={cn(
					`group/connector top-1/2! right-auto! left-full! flex! h-11.5! w-12! min-w-0!
					-translate-y-1/2 transform-none! cursor-pointer! items-center justify-center
					rounded-none! border-none! bg-transparent!`,
					{ 'pointer-events-none! opacity-0': inactive },
				)}
			>
				<span
					className={cn(
						'pointer-events-none flex size-7 items-center justify-center opacity-0 group-hover/node:opacity-100',
						{ 'opacity-100': menuOpen },
					)}
				>
					<span
						className={cn(
							'bg-background-default flex size-5.5 items-center justify-center rounded-full group-hover/connector:hidden',
							{ hidden: menuOpen },
						)}
					>
						<span className='border-diagram-connector size-3 rounded-full border-2' />
					</span>
					<span
						className={cn(
							`bg-diagram-connector-hover border-diagram-connector hidden size-7
							items-center justify-center rounded-full border group-hover/connector:flex`,
							{ flex: menuOpen },
						)}
					>
						<Icon data={add} size={18} className='fill-diagram-connector' />
					</span>
				</span>
			</Handle>
			{menuOpen && (
				// React portals bubble clicks to the node, which would open the side sheet
				<div className='contents' onClick={event => event.stopPropagation()}>
					<AddArcMenu
						sourceNodeId={nodeId}
						anchorEl={anchorEl}
						onClose={() => setMenuOpen(false)}
					/>
				</div>
			)}
		</>
	);
};

type AddArcMenuProps = {
	sourceNodeId: string;
	anchorEl: HTMLElement | null;
	onClose: () => void;
};

const AddArcMenu = ({ sourceNodeId, anchorEl, onClose }: AddArcMenuProps) => {
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const edges = useEdges();
	const issues = useSelectedProjectIssues();
	const project = useSelectedProject();
	const { mutate: createEdge } = useCreateEdge();

	const targets = nodes.flatMap(node => {
		if (node.id === sourceNodeId) return [];
		const isConnected = edges.some(
			edge =>
				(edge.source === sourceNodeId && edge.target === node.id) ||
				(edge.source === node.id && edge.target === sourceNodeId),
		);
		const issue = issues.find(currentIssue => currentIssue.id === node.data.issue_id);
		if (isConnected || !issue) return [];
		return [{ nodeId: node.id, name: issue.name, type: issue.type }];
	});

	const addArc = (targetNodeId: string) => {
		createEdge({
			id: crypto.randomUUID(),
			tail_id: sourceNodeId,
			head_id: targetNodeId,
			project_id: project.id,
		});
		onClose();
	};

	return (
		<Menu
			open
			anchorEl={anchorEl}
			onClose={onClose}
			placement='right-start'
			className='nodrag nopan nowheel'
		>
			<Menu.Section title='Add arc to'>
				{targets.length === 0 ? (
					<Menu.Item disabled>No available nodes</Menu.Item>
				) : (
					targets.map(target => (
						<Menu.Item key={target.nodeId} onClick={() => addArc(target.nodeId)}>
							<IssueTypeGlyph type={target.type} />
							<p>{target.name}</p>
						</Menu.Item>
					))
				)}
			</Menu.Section>
		</Menu>
	);
};

const glyphClasses: Partial<Record<IssueType, { pill: string; glyph: string }>> = {
	Decision: { pill: 'bg-[#FFF7D0]', glyph: 'size-2.5 rounded-[2px]' },
	Uncertainty: { pill: 'bg-[#E1FCEA]', glyph: 'size-2.5 rounded-full' },
	Utility: { pill: 'bg-[#CAE6FA]', glyph: 'size-2 rotate-45 rounded-[1px]' },
};

const IssueTypeGlyph = ({ type }: { type: IssueType }) => {
	const classes = glyphClasses[type];
	if (!classes) return null;
	return (
		<span className={cn('flex h-4.5 items-center rounded-xl px-1.5', classes.pill)}>
			<span className={cn('border border-[#585858]', classes.glyph)} />
		</span>
	);
};
