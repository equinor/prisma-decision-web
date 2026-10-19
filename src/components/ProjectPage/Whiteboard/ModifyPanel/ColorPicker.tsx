import { useReactFlow } from '@xyflow/react';
import { useMemo } from 'react';
import { ReactFlowWhiteboardNode } from '../../../../types';
import { cn } from '../../../../utils/cn';
import { debounce } from '../../../../utils/debounce';
import { WhiteboardNode } from '../../../../validators';
import { ColorPickerLauncher } from '../../../common/ColorPickerLauncher';

const predefinedColors = ['default', '#fca5a5', '#ff9200', '#40d38f', '#52c0ff'] as const;

export const ColorPicker = ({
	updateNode,
	selectedNode,
}: {
	updateNode: (data: Partial<WhiteboardNode>) => void;
	selectedNode: WhiteboardNode;
}) => {
	const { setNodes } = useReactFlow<ReactFlowWhiteboardNode>();
	const debouncedCommit = useMemo(() => debounce((commit: () => void) => commit(), 300), []);
	const selectedColor =
		selectedNode.color && selectedNode.color !== 'default' ? selectedNode.color : '#ffffff';

	const previewColor = (color: string) => {
		setNodes(currentNodes =>
			currentNodes.map(node =>
				node.selected ? { ...node, data: { ...node.data, color } } : node,
			),
		);
		debouncedCommit(() => updateNode({ color }));
	};

	return (
		<div className='flex flex-col gap-1'>
			<h3 className='text-xs font-medium'>Stroke</h3>
			<div className='flex gap-1.5'>
				{predefinedColors.map(color => (
					<button
						key={color}
						onClick={() => {
							debouncedCommit.cancel();
							updateNode({ color });
						}}
						style={{
							backgroundColor:
								color === 'default' ? 'var(--color-whiteboard-stroke)' : color,
						}}
						className={cn('size-8 cursor-pointer rounded-sm hover:scale-105', {
							outline: selectedNode.color === color,
						})}
					/>
				))}
				<ColorPickerLauncher
					title='Choose custom color'
					value={selectedColor}
					onChange={previewColor}
				/>
			</div>
		</div>
	);
};
