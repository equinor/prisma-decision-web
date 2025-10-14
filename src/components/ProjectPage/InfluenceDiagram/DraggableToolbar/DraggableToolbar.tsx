import { DragDropProvider } from '@dnd-kit/react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';
import { Toolbar } from './Toolbar';
import { ToolbarOverlay } from './ToolbarOverlay';

export const DraggableToolbar = ({ ...rest }: DraggableToolbarProps) => {
	const [_, setToolBarPosition] = useLocalStorage('toolbar-position', 'top');
	const [isDragging, setIsDragging] = useState(false);
	return (
		<DragDropProvider
			onDragEnd={e => {
				setIsDragging(false);
				if (!e.operation.target?.id) return;
				setToolBarPosition(e.operation.target.id as 'top' | 'bottom');
			}}
			onDragStart={() => setIsDragging(true)}
		>
			<Toolbar {...rest} />
			{isDragging && <ToolbarOverlay />}
		</DragDropProvider>
	);
};

type DraggableToolbarProps = {
	onClickPanMode: () => void;
	onClickSelectionMode: () => void;
};
