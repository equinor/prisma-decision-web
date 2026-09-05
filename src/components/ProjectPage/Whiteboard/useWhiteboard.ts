import {
	applyNodeChanges,
	NodeChange,
	NodeMouseHandler,
	OnNodeDrag,
	useNodesState,
} from '@xyflow/react';
import { useEffect } from 'react';
import { useUpdateWhiteboardNodes } from '../../../hooks/api/useUpdateWhiteboardNodes';
import { useSelectedProjectWhiteboardNodes } from '../../../hooks/useSelectedProjectWhiteboardNodes';
import { ReactFlowWhiteboardNode } from '../../../types';
import useSelectedWhiteboardSheet from '../../../hooks/useSelectedWhiteboardSheet';
import { BOTTOM_LAYER_Z_INDEX } from '../../../validators';

type UseWhiteboardOptions = {
	snapToGrid?: boolean;
};

const snapGridSize = 30;

const snapToGrid = (value: number) => snapGridSize * Math.round(value / snapGridSize);

const snapRectangleDimensions = (
	changes: NodeChange<ReactFlowWhiteboardNode>[],
	nodes: ReactFlowWhiteboardNode[],
) => {
	return changes.map(change => {
		if (change.type !== 'dimensions' || !change.dimensions) return change;

		const node = nodes.find(node => node.id === change.id);
		if (node?.data.type !== 'Rectangle') return change;

		return {
			...change,
			dimensions: {
				width: Math.max(snapToGrid(change.dimensions.width), snapGridSize),
				height: Math.max(snapToGrid(change.dimensions.height), snapGridSize),
			},
		};
	});
};

export const useWhiteboard = ({ snapToGrid = false }: UseWhiteboardOptions = {}) => {
	const nodes = useSelectedProjectWhiteboardNodes();
	const sheet = useSelectedWhiteboardSheet();
	const sheetNodes = sheet ? nodes.filter(node => node.data.board_sheet_id === sheet.id) : [];
	const { mutate: updateWhiteboardNodes } = useUpdateWhiteboardNodes();
	const [localNodes, setLocalNodes] = useNodesState([] as ReactFlowWhiteboardNode[]);

	useEffect(() => {
		setLocalNodes(currentNodes =>
			sheetNodes.map(n => {
				const localNode = currentNodes.find(ln => ln.id === n.id);
				if (!localNode) return n;
				return {
					...n,
					measured: localNode.measured,
					selected: localNode.selected,
					zIndex: localNode.zIndex ?? n.zIndex ?? (n.type === 'Rectangle' ? 0 : 1),
				};
			}),
		);
	}, [sheetNodes, setLocalNodes]);

	const onNodesChange = (changes: NodeChange<ReactFlowWhiteboardNode>[]) => {
		const nextChanges = snapToGrid ? snapRectangleDimensions(changes, sheetNodes) : changes;
		setLocalNodes(currentNodes => applyNodeChanges(nextChanges, currentNodes));
	};

	const raiseNode = (nodeId: string) => {
		const highestZIndex = Math.max(
			...localNodes.map(node => node.zIndex ?? BOTTOM_LAYER_Z_INDEX),
			BOTTOM_LAYER_Z_INDEX,
		);
		const zIndex = highestZIndex + 1;
		setLocalNodes(currentNodes =>
			currentNodes.map(node =>
				node.id === nodeId ? { ...node, zIndex, data: { ...node.data, zIndex } } : node,
			),
		);
		updateWhiteboardNodes(
			localNodes.map(node => ({
				...node.data,
				zIndex: node.id === nodeId ? zIndex : node.data.zIndex,
				x_position: node.position.x,
				y_position: node.position.y,
			})),
		);
	};

	const onNodeDragStop = () => {
		updateWhiteboardNodes(
			localNodes.map(node => ({
				...node.data,
				x_position: node.position.x,
				y_position: node.position.y,
			})),
		);
	};

	const onNodeClick: NodeMouseHandler<ReactFlowWhiteboardNode> = (_, clickedNode) => {
		raiseNode(clickedNode.id);
	};

	const onNodeDragStart: OnNodeDrag<ReactFlowWhiteboardNode> = (_, draggedNode) => {
		raiseNode(draggedNode.id);
	};

	return {
		nodes: localNodes,
		onNodesChange,
		setNodes: setLocalNodes,
		onNodeDragStart,
		onNodeDragStop,
		onNodeClick,
	};
};
