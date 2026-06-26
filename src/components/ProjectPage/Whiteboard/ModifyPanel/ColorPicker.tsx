import { cn } from '../../../../utils/cn';
import { WhiteboardNode } from '../../../../validators';

const predefinedColors = ['default', '#ff6467', '#ffff00', '#00ffff'] as const;

export const ColorPicker = ({
	updateNode,
	selectedNode,
}: {
	updateNode: (data: Partial<WhiteboardNode>) => void;
	selectedNode: WhiteboardNode;
}) => {
	return (
		<div className='flex flex-col gap-1'>
			<h3 className='text-xs font-medium'>Stroke</h3>
			<div className='flex gap-1.5'>
				{predefinedColors.map(color => (
					<button
						key={color}
						onClick={() => updateNode({ color })}
						style={{
							backgroundColor:
								color === 'default' ? 'var(--color-whiteboard-stroke)' : color,
						}}
						className={cn('size-8 cursor-pointer rounded-sm hover:scale-105', {
							outline: selectedNode.color === color,
						})}
					/>
				))}
				<input
					type='color'
					value={
						selectedNode.color && selectedNode.color !== 'default'
							? selectedNode.color
							: '#ffffff'
					}
					onChange={e => updateNode({ color: e.target.value })}
					style={{
						backgroundColor:
							selectedNode.color && selectedNode.color !== 'default'
								? selectedNode.color
								: '#ffffff',
					}}
					className={cn('size-8 cursor-pointer rounded-sm hover:scale-105', {})}
				/>
			</div>
		</div>
	);
};
