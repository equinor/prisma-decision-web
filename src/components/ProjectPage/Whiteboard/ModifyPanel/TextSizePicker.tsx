import { Button } from '@equinor/eds-core-react';
import { WhiteboardNode } from '../../../../validators';

export const TextSizePicker = ({
	updateNode,
	selectedNode,
}: {
	updateNode: (data: Partial<WhiteboardNode>) => void;
	selectedNode: WhiteboardNode;
}) => {
	return (
		<div className='flex flex-col gap-1'>
			<h3 className='text-xs font-semibold'>Font size</h3>
			<div className='flex gap-1.5'>
				<Button.Toggle
					className='h-8! w-8!'
					selectedIndexes={selectedNode.text_size === 16 ? [0] : []}
				>
					<Button
						className='relative size-8 text-xl!'
						onClick={() => updateNode({ text_size: 16 })}
					>
						S
					</Button>
				</Button.Toggle>
				<Button.Toggle
					className='size-8!'
					selectedIndexes={selectedNode.text_size === 24 ? [0] : []}
				>
					<Button
						className='relative size-8 text-xl!'
						onClick={() => updateNode({ text_size: 24 })}
					>
						M
					</Button>
				</Button.Toggle>
				<Button.Toggle
					className='size-8!'
					selectedIndexes={selectedNode.text_size === 32 ? [0] : []}
				>
					<Button
						className='relative size-8 text-xl!'
						onClick={() => updateNode({ text_size: 32 })}
					>
						L
					</Button>
				</Button.Toggle>
				<Button.Toggle
					className='size-8!'
					selectedIndexes={selectedNode.text_size === 48 ? [0] : []}
				>
					<Button
						className='relative size-8 text-xl!'
						onClick={() => updateNode({ text_size: 48 })}
					>
						XL
					</Button>
				</Button.Toggle>
			</div>
		</div>
	);
};
