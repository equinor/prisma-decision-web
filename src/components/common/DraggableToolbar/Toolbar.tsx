import { DragDropProvider, useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';
import { dragHandle } from '../../../icons';
import { cn } from '../../../utils/cn';
import { ToolbarOverlay } from '../../ProjectPage/ToolbarOverlay';

export const ToolBar = ({ children }: { children: React.ReactNode }) => {
	const { handleRef, ref } = useDraggable({
		id: 'toolbar',
	});
	const [toolBarPosition] = useLocalStorage('toolbar-position', 'top');
	return (
		<div
			className={cn(
				'bg-background-default shadow-tile absolute left-1/2 z-10 flex w-max -translate-x-1/2 gap-2 rounded-sm p-2',
				{
					'top-6': toolBarPosition === 'top',
					'bottom-6': toolBarPosition === 'bottom',
				},
			)}
			ref={ref}
		>
			<div className='-mx-1.5 flex cursor-grab items-center justify-center' ref={handleRef}>
				<Icon data={dragHandle} size={24} />
			</div>
			{children}
		</div>
	);
};

export const ToolbarDragDropProvider = ({ children }: { children: React.ReactNode }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [_, setToolBarPosition] = useLocalStorage('toolbar-position', 'top');
	return (
		<DragDropProvider
			onDragEnd={e => {
				setIsDragging(false);
				if (!e.operation.target?.id) return;
				setToolBarPosition(e.operation.target.id as 'top' | 'bottom');
			}}
			onDragStart={() => setIsDragging(true)}
		>
			{children}
			{isDragging && <ToolbarOverlay />}
		</DragDropProvider>
	);
};

export const ToolbarSeparator = () => {
	return <div className='bg-background-light h-9 w-0.5' />;
};
