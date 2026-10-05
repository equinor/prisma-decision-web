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
	handleId?: string;
};

// Source handle shown next to a node on hover: drag to draw an arc, click to pick a target.
export const NodeConnector = ({
	nodeId,
	canStartConnection,
	hidden,
	handleId = 'node-source',
}: NodeConnectorProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const inactive = hidden || !canStartConnection;

	return (
		<>
			<Handle
				ref={setAnchorEl}
				type='source'
				position={Position.Right}
				id={handleId}
				isConnectableStart={canStartConnection}
				onClick={event => {
					event.stopPropagation();
					if (canStartConnection) setMenuOpen(true);
				}}
				className={cn(
					`group/connector top-1/2! right-auto! left-full! flex! h-11.5! w-12! min-w-0!
					-translate-y-1/2 transform-none! cursor-pointer! items-center justify-start pl-2
					rounded-none! border-none! bg-transparent!`,
					{ 'pointer-events-none! opacity-0': inactive },
				)}
			>
				{/* Transitions use `!` to beat the global `* { transition: ... !important }` in index.css */}
				{/* Slides out from under the shape (rendered after the handle, so painted on top) */}
				<span
					className={cn(
						'pointer-events-none relative flex size-7 items-center justify-center',
						menuOpen
							? 'translate-x-0 opacity-100'
							: `-translate-x-10 opacity-0
								[transition:translate_185ms_cubic-bezier(0.4,0,1,1),opacity_65ms_linear_135ms]!
								group-hover/node:translate-x-0 group-hover/node:opacity-100
								group-hover/node:[transition:translate_375ms_cubic-bezier(0.34,1.4,0.64,1),opacity_85ms_ease-out]!`,
					)}
				>
					{/* Background grows from the small dot (22px) into the full button (28px) */}
					<span
						className={cn(
							`absolute inset-0 rounded-full border
							[transition:scale_350ms_cubic-bezier(0.34,1.6,0.64,1),background-color_200ms_ease-out,border-color_200ms_ease-out]!`,
							menuOpen
								? 'bg-diagram-connector-hover border-diagram-connector scale-100'
								: `bg-background-default scale-[0.786] border-transparent
									group-hover/connector:bg-diagram-connector-hover
									group-hover/connector:border-diagram-connector group-hover/connector:scale-100`,
						)}
					/>
					<span
						className={cn(
							`border-diagram-connector absolute size-3 rounded-full border-2
							[transition:scale_300ms_cubic-bezier(0.2,0,0,1),opacity_200ms_ease-out]!`,
							menuOpen
								? 'scale-[2.33] opacity-0'
								: 'group-hover/connector:scale-[2.33] group-hover/connector:opacity-0',
						)}
					/>
					<span
						className={cn(
							`relative flex
							[transition:scale_350ms_cubic-bezier(0.34,1.6,0.64,1),rotate_350ms_cubic-bezier(0.34,1.6,0.64,1),opacity_150ms_ease-out]!`,
							menuOpen
								? 'scale-100 rotate-0 opacity-100'
								: `scale-0 -rotate-90 opacity-0 group-hover/connector:scale-100
									group-hover/connector:rotate-0 group-hover/connector:opacity-100`,
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
