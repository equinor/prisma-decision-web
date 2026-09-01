import { Slider } from '@equinor/eds-core-react';
import { Panel, Node, useStore } from '@xyflow/react';
import { useUpdateWhiteboardNodes } from '../../../../hooks/api/useUpdateWhiteboardNodes';
import { WhiteboardNode } from '../../../../validators';
import { JSX } from 'react';
import { ColorPicker } from './ColorPicker';
import { StrokeStylePicker } from './StrokeStylePicker';
import { TextSizePicker } from './TextSizePicker';
import { StrokeWidthPicker } from './StrokeWidthPicker';

const textNodeModifiers: ModifierComponent[] = [ColorPicker, TextSizePicker];
const shapeNodeModifiers: ModifierComponent[] = [ColorPicker, StrokeWidthPicker, StrokeStylePicker];
const arrowNodeModifiers: ModifierComponent[] = [ColorPicker, StrokeWidthPicker];
const issueNodeModifiers: ModifierComponent[] = [];

export const ToolPanel = () => {
	const { mutate: updateWhiteboardNodes } = useUpdateWhiteboardNodes();

	const { nodes } = useStore(state => ({
		nodes: state.nodes.filter(node => node.selected) as Node<WhiteboardNode>[],
	}));

	const selectedNode = nodes.length > 0 ? nodes[0] : null;

	const updateNode = (updated: Partial<WhiteboardNode>) => {
		if (nodes.length === 0) return;
		updateWhiteboardNodes(
			nodes.map(node => ({
				...node.data,
				...updated,
			})),
		);
	};

	if (!selectedNode) return null;
	let modifiers: ModifierComponent[] = [];
	if (selectedNode.data.type === 'Text') modifiers = textNodeModifiers;
	if (selectedNode.data.type === 'Rectangle') modifiers = shapeNodeModifiers;
	if (selectedNode.data.type === 'Freehand') modifiers = shapeNodeModifiers;
	if (selectedNode.data.type === 'Arrow') modifiers = arrowNodeModifiers;
	if (selectedNode.data.type === 'Issue') modifiers = issueNodeModifiers;
	return (
		<Panel
			position='top-left'
			className='bg-background-default shadow-tile flex flex-col gap-4 p-2'
		>
			{modifiers.map((Modifier, index) => (
				<Modifier key={index} updateNode={updateNode} selectedNode={selectedNode.data} />
			))}

			<div className='flex flex-col gap-1 pb-4'>
				<h3 className='text-xs font-medium'>Opacity</h3>
				<div className='px-1'>
					<Slider
						value={selectedNode.data.opacity ?? 100}
						onChangeCommitted={(_, value) => updateNode({ opacity: value[0] })}
					/>
				</div>
			</div>
		</Panel>
	);
};

type ModifierProps = {
	updateNode: (data: Partial<WhiteboardNode>) => void;
	selectedNode: WhiteboardNode;
};

type ModifierComponent = (props: ModifierProps) => JSX.Element;
