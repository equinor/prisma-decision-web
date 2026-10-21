import { Menu } from '@equinor/eds-core-react';
import { Handle, Position, useEdges, useNodes } from '@xyflow/react';
import { useState } from 'react';
import { useCreateEdge } from '../../../hooks/api/useCreateEdge';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../../../types';
import { cn } from '../../../utils/cn';
import { IssueType } from '../../../validators';
import { ConnectorGlyph } from '../../common/ConnectorGlyph';
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
					-translate-y-1/2 transform-none! cursor-pointer! items-center justify-start rounded-none!
					border-none! bg-transparent! pl-2`,
					{ 'pointer-events-none! opacity-0': inactive },
				)}
			>
				<ConnectorGlyph open={menuOpen} />
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
