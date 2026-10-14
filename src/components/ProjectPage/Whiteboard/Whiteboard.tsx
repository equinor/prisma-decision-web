import { useKeyHold } from '@tanstack/react-hotkeys';
import {
	Background,
	BackgroundVariant,
	ConnectionMode,
	NodeProps,
	ReactFlow,
	SelectionMode,
} from '@xyflow/react';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useDeleteWhiteboardNode } from '../../../hooks/api/useDeleteWhiteboardNode';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ReactFlowWhiteboardNode } from '../../../types';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import {
	IssueCard,
	IssueCardEditMenuItem,
	IssueCardExpandableContent,
	IssueCardExpandTrigger,
	IssueCardHeader,
	IssueCardMenu,
	IssueCardStates,
} from '../../common/Cards/IssueCard';
import { ArrowNode } from './Arrow/ArrowNode';
import { ArrowTool } from './Arrow/ArrowTool';
import { DraggableToolbar } from './DraggableToolbar/DraggableToolbar';
import { FreehandNode } from './FreehandNode';
import { FreehandTool } from './FreehandTool';
import { ToolPanel } from './ModifyPanel/ModifyPanel';
import { RectangleNode } from './Rectangle/RectangleNode';
import { RectangleTool } from './Rectangle/RectangleTool';
import { TextNode } from './Text/TextNode';
import { TextTool } from './Text/TextTool';
import { activeToolAtom } from './activeToolAtom';
import { useWhiteboard } from './useWhiteboard';

const IssueNode = ({ data, selected }: NodeProps<ReactFlowWhiteboardNode>) => {
	const issues = useSelectedProjectIssues();
	const issue = issues.find(issue => issue.id === data.data);
	if (!issue) return null;
	const cardOpacity = (data.opacity ?? 100) / 100;
	return (
		<div
			className={`overflow-hidden rounded-sm border-2 ${getDiagramIssueBorderColor(issue.type, selected)}`}
			style={{ opacity: cardOpacity }}
		>
			<IssueCard issue={issue}>
				<IssueCardHeader>
					<IssueCardMenu>
						<IssueCardEditMenuItem />
					</IssueCardMenu>
				</IssueCardHeader>
				<IssueCardExpandableContent />
				<IssueCardStates>
					<IssueCardExpandTrigger />
				</IssueCardStates>
			</IssueCard>
		</div>
	);
};

export const Whiteboard = () => {
	const holdingShift = useKeyHold('Shift');
	const holdingControl = useKeyHold('Alt');
	const enableSnapToGrid = holdingShift && holdingControl;
	const { nodes, onNodesChange, onNodeDragStart, onNodeDragStop, setNodes, onNodeClick } =
		useWhiteboard({
			snapToGrid: enableSnapToGrid,
		});
	const nodeTypes = useMemo(
		() => ({
			Arrow: (props: NodeProps<ReactFlowWhiteboardNode>) => (
				<ArrowNode {...props} setNodes={setNodes} />
			),
			Freehand: FreehandNode,
			Rectangle: RectangleNode,
			Issue: IssueNode,
			Text: TextNode,
		}),
		[setNodes],
	);

	const { mutate: deleteWhiteboardNode } = useDeleteWhiteboardNode();
	const mode = useAtomValue(activeToolAtom);
	const isSelecting = mode === 'selection';
	const isRectangleMode = mode === 'rectangle';
	const isArrowMode = mode === 'arrow';
	const isTextMode = mode === 'text';
	const isFreehandMode = mode === 'freehand';

	return (
		<div
			className='bg-background-light absolute
			inset-0 rounded-sm'
		>
			<ReactFlow
				minZoom={0.1}
				zoomOnScroll={true}
				nodes={nodes}
				snapToGrid={enableSnapToGrid}
				snapGrid={[30, 30]}
				panOnDrag={!isSelecting}
				selectNodesOnDrag={isSelecting}
				selectionMode={SelectionMode.Full}
				elevateNodesOnSelect
				connectionMode={ConnectionMode.Strict}
				selectionOnDrag={true}
				zoomOnDoubleClick={false}
				selectionKeyCode={['Control']}
				deleteKeyCode={['Backspace', 'Delete']}
				nodeTypes={nodeTypes}
				onDelete={data => deleteWhiteboardNode(data.nodes.map(n => n.id))}
				onNodeDragStart={onNodeDragStart}
				onNodeDragStop={onNodeDragStop}
				onNodesChange={onNodesChange}
				onNodeClick={onNodeClick}
				proOptions={{ hideAttribution: true }}
				fitView
				fitViewOptions={{ padding: 0.4 }}
			>
				{isArrowMode && <ArrowTool />}
				{isFreehandMode && <FreehandTool />}
				{isRectangleMode && <RectangleTool />}
				{isTextMode && <TextTool />}
				{enableSnapToGrid && (
					<Background
						variant={BackgroundVariant.Lines}
						size={1}
						gap={30}
						patternClassName='opacity-20'
					/>
				)}
				<DraggableToolbar />
				<ToolPanel />
			</ReactFlow>
		</div>
	);
};
