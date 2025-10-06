import { Button, Icon, Menu } from '@equinor/eds-core-react';
import { edit, fullscreen, zoom_in, zoom_out } from '@equinor/eds-icons';
import {
	Background,
	ConnectionMode,
	MarkerType,
	Node,
	ReactFlow,
	SelectionMode,
	useReactFlow,
} from '@xyflow/react';

import { useState } from 'react';
import { useUpdateIssuesOptimistic } from '../../../hooks/api/useUpdateIssues';
import { convertNodesToIssues } from '../../../utils/convertNodesToIssues';
import { IssueType } from '../../../validators';
import { DragIcon } from '../../common/DragIcon';
import { DragToSelectIcon } from '../../common/DragToSelectIcon';
import { CreateIssues } from '../CreateIssue';
import { DeleteIssuesDialog } from '../DeleteIssuesDialog';
import { ToggleExpandAll } from '../ToggleExpandAll';
import { ConnectionLine } from './ConnectingLine';
import { CustomEdge } from './CustomEdge';
import { IssueNode } from './IssueNode';
import { useInfluenceDiagram } from './useInfluenceDiagram';

const nodeTypes = { issue: IssueNode };
const edgeTypes = { issue: CustomEdge };

export const InfluenceDiagram = () => {
	const {
		nodes,
		edges,
		onConnect,
		isValidConnection,
		onEdgesChange,
		onNodeDragStop,
		onNodesChange,
		onReconnect,
		onReconnectStart,
		selectedIssues,
		onClickPanMode,
		onClickSelectionMode,
		isSelecting,
	} = useInfluenceDiagram();
	return (
		<div
			className='bg-background-light absolute
			inset-0 rounded-sm'
		>
			<ReactFlow
				minZoom={0.1}
				nodes={nodes}
				edges={edges}
				defaultEdgeOptions={{
					type: 'issue',
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: 'rgba(var(--eds_primary_resting), 1)',
					},
				}}
				selectionMode={SelectionMode.Partial}
				connectionMode={ConnectionMode.Loose}
				panOnDrag={!isSelecting}
				selectNodesOnDrag={isSelecting}
				selectionKeyCode={['Control']}
				onReconnect={onReconnect}
				selectionOnDrag={true}
				onNodeDragStop={onNodeDragStop}
				onNodesChange={onNodesChange}
				onReconnectStart={onReconnectStart}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				connectionLineComponent={ConnectionLine}
				onConnect={onConnect}
				isValidConnection={isValidConnection}
				onEdgesChange={onEdgesChange}
				proOptions={{ hideAttribution: true }}
				fitView
			>
				<Background />
				<div
					className='bg-background-default shadow-tile absolute bottom-36
					left-1/2 z-10 flex w-max -translate-x-1/2 gap-2 rounded-sm p-2'
				>
					<ZoomControls />
					<div className='bg-background-light h-9 w-[2px]' />
					<TogglePanMode checked={!isSelecting} onChange={onClickPanMode} />
					<ToggleSelectionMode checked={isSelecting} onChange={onClickSelectionMode} />
					<ToggleExpandAll />
					<div className='bg-background-light h-9 w-[2px]' />
					<DeleteIssuesDialog issue={convertNodesToIssues(selectedIssues)} />
					<ChangeIssueType nodes={selectedIssues} />
					<div className='bg-background-light h-9 w-[2px]' />
					<CreateIssues />
				</div>
			</ReactFlow>
		</div>
	);
};

const ZoomControls = () => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();
	return (
		<div className='flex gap-2'>
			<Button className='px-1.5!' onClick={() => zoomIn()} variant='outlined'>
				<Icon data={zoom_in} />
			</Button>
			<Button className='px-1.5!' onClick={() => zoomOut()} variant='outlined'>
				<Icon data={zoom_out} />
			</Button>
			<Button className='px-1.5!' onClick={() => fitView()} variant='outlined'>
				<Icon data={fullscreen} />
			</Button>
		</div>
	);
};

const ToggleSelectionMode = ({ checked, onChange }: ChangeIssueTypeProps) => {
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Toggle selection mode'
		>
			<Button className='px-1.5!'>
				<DragToSelectIcon />
			</Button>
		</Button.Toggle>
	);
};

const TogglePanMode = ({ checked, onChange }: ChangeIssueTypeProps) => {
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Toggle pan mode'
		>
			<Button className='px-1.5!'>
				<DragIcon />
			</Button>
		</Button.Toggle>
	);
};

type ChangeIssueTypeProps = {
	checked: boolean;
	onChange: () => void;
};

const ChangeIssueType = ({ nodes }: { nodes: Node[] }) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();
	const [isOpen, setIsOpen] = useState(false);

	const handleIssueTypeChange = (newType: IssueType) => {
		const issues = convertNodesToIssues(nodes);
		const updatedIssues = issues.map(issue => ({
			...issue,
			type: newType,
		}));
		updateIssues(updatedIssues);
		setIsOpen(false);
	};

	const noSelectedIssues = nodes.length === 0;

	return (
		<>
			<Button
				className='px-1.5!'
				disabled={noSelectedIssues}
				onClick={() => setIsOpen(prev => !prev)}
				ref={setAnchorEl}
				variant='outlined'
			>
				<Icon data={edit} />
			</Button>
			<Menu open={isOpen} anchorEl={anchorEl} onClose={() => setIsOpen(false)}>
				<Menu.Item onClick={() => handleIssueTypeChange('Fact')}>Fact</Menu.Item>
				<Menu.Item onClick={() => handleIssueTypeChange('Decision')}>Decision</Menu.Item>
				<Menu.Item onClick={() => handleIssueTypeChange('Uncertainty')}>
					Uncertainty
				</Menu.Item>
				<Menu.Item onClick={() => handleIssueTypeChange('Unassigned')}>
					Unassigned
				</Menu.Item>
			</Menu>
		</>
	);
};
