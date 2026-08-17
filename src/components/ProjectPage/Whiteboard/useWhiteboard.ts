import { applyNodeChanges, NodeChange, useNodesState } from '@xyflow/react';
import { useEffect } from 'react';
import { useUpdateWhiteboardNodes } from '../../../hooks/api/useUpdateWhiteboardNodes';
import { useSelectedProjectWhiteboardNodes } from '../../../hooks/useSelectedProjectWhiteboardNodes';
import { ReactFlowWhiteboardNode } from '../../../types';
import useSelectedWhiteboardSheet from '../../../hooks/useSelectedWhiteboardSheet';

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
	const sheetNodes = nodes.filter(node => node.data.board_sheet_id === sheet.id);
	const { mutate: updateWhiteboardNodes } = useUpdateWhiteboardNodes();
	const [localNodes, setLocalNodes] = useNodesState([] as ReactFlowWhiteboardNode[]);

	useEffect(() => {
		setLocalNodes(
			sheetNodes.map(n => {
				const localNode = localNodes.find(ln => ln.id === n.id);
				if (!localNode) return n;
				return {
					...n,
					selected: localNode.selected,
				};
			}),
		);
	}, [sheetNodes, setLocalNodes]);

	const onNodesChange = (changes: NodeChange<ReactFlowWhiteboardNode>[]) => {
		const nextChanges = snapToGrid ? snapRectangleDimensions(changes, sheetNodes) : changes;
		const s = applyNodeChanges(nextChanges, localNodes);
		setLocalNodes(s);
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

	return {
		nodes: localNodes,
		onNodesChange,
		setNodes: setLocalNodes,
		onNodeDragStop,
	};
};
