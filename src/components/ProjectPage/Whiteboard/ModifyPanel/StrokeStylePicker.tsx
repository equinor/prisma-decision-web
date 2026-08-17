import { Button, Icon } from '@equinor/eds-core-react';
import { solidLineIcon, dashedLineIcon, dottedLineIcon } from '../../../../icons';
import { WhiteboardNode } from '../../../../validators';

export const StrokeStylePicker = ({
	updateNode,
	selectedNode,
}: {
	updateNode: (data: Partial<WhiteboardNode>) => void;
	selectedNode: WhiteboardNode;
}) => {
	return (
		<div className='flex flex-col gap-1'>
			<h3 className='text-xs font-medium'>Stroke style</h3>
			<div className='flex gap-1.5'>
				<Button.Toggle
					className='h-8! w-8!'
					selectedIndexes={selectedNode.stroke_style === 'Solid' ? [0] : []}
				>
					<Button
						className='relative size-8'
						onClick={() => updateNode({ stroke_style: 'Solid' })}
					>
						<Icon data={solidLineIcon} />
					</Button>
				</Button.Toggle>
				<Button.Toggle
					className='size-8!'
					selectedIndexes={selectedNode.stroke_style === 'Dashed' ? [0] : []}
				>
					<Button
						className='relative size-8'
						onClick={() => updateNode({ stroke_style: 'Dashed' })}
					>
						<Icon data={dashedLineIcon} />
					</Button>
				</Button.Toggle>
				<Button.Toggle
					className='size-8!'
					selectedIndexes={selectedNode.stroke_style === 'Dotted' ? [0] : []}
				>
					<Button
						className='relative size-8'
						onClick={() => updateNode({ stroke_style: 'Dotted' })}
					>
						<Icon data={dottedLineIcon} />
					</Button>
				</Button.Toggle>
			</div>
		</div>
	);
};
