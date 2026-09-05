import { Button, Icon } from '@equinor/eds-core-react';
import { thinStrokeIcon, mediumStrokeIcon, thickStrokeIcon } from '../../../../icons';
import { WhiteboardNode } from '../../../../validators';

export const StrokeWidthPicker = ({
	updateNode,
	selectedNode,
}: {
	updateNode: (data: Partial<WhiteboardNode>) => void;
	selectedNode: WhiteboardNode;
}) => {
	return (
		<div className='flex flex-col gap-1'>
			<h3 className='text-xs font-medium'>Stroke width</h3>
			<div className='flex gap-1.5'>
				<Button.Toggle
					className='h-8! w-8!'
					selectedIndexes={selectedNode.stroke_width === 2 ? [0] : []}
				>
					<Button
						className='relative size-8'
						onClick={() => updateNode({ stroke_width: 2 })}
					>
						<Icon data={thinStrokeIcon} />
					</Button>
				</Button.Toggle>
				<Button.Toggle
					className='size-8!'
					selectedIndexes={selectedNode.stroke_width === 4 ? [0] : []}
				>
					<Button
						className='relative size-8'
						onClick={() => updateNode({ stroke_width: 4 })}
					>
						<Icon data={mediumStrokeIcon} />
					</Button>
				</Button.Toggle>
				<Button.Toggle
					className='size-8!'
					selectedIndexes={selectedNode.stroke_width === 6 ? [0] : []}
				>
					<Button
						className='relative size-8'
						onClick={() => updateNode({ stroke_width: 6 })}
					>
						<Icon data={thickStrokeIcon} />
					</Button>
				</Button.Toggle>
			</div>
		</div>
	);
};
