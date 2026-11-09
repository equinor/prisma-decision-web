import { DragDropProvider, useDraggable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { drag_indicator } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { ReactNode, useState } from 'react';
import { cn } from '../../../utils/cn';
import { ToolbarOverlay } from '../../ProjectPage/ToolbarOverlay';
import { Toolbar } from './Toolbar';

export const DraggableToolbar = ({
	children,
	'aria-label': ariaLabel,
}: {
	children: ReactNode;
	'aria-label': string;
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [, setToolbarPosition] = useLocalStorage('toolbar-position', 'top');

	return (
		<DragDropProvider
			onDragEnd={event => {
				setIsDragging(false);
				if (event.canceled || event.operation.source?.id !== 'toolbar') return;
				const position = event.operation.target?.id;
				if (position !== 'top' && position !== 'bottom') return;
				setToolbarPosition(position);
			}}
			onDragStart={event => setIsDragging(event.operation.source?.id === 'toolbar')}
		>
			<DraggableToolbarContent aria-label={ariaLabel}>{children}</DraggableToolbarContent>
			{isDragging && <ToolbarOverlay />}
		</DragDropProvider>
	);
};

const DraggableToolbarContent = ({
	children,
	'aria-label': ariaLabel,
}: {
	children: ReactNode;
	'aria-label': string;
}) => {
	const { handleRef, ref } = useDraggable({
		id: 'toolbar',
	});
	const [toolbarPosition] = useLocalStorage('toolbar-position', 'top');

	return (
		<Toolbar
			aria-label={ariaLabel}
			className={cn('absolute left-1/2 z-10 -translate-x-1/2', {
				'top-6': toolbarPosition === 'top',
				'bottom-6': toolbarPosition === 'bottom',
			})}
			ref={ref}
		>
			<button
				ref={handleRef}
				type='button'
				aria-label='Move toolbar'
				title='Move toolbar'
				className='text-text-secondary hover:bg-background-light focus-visible:outline-primary-resting flex h-9 w-6 cursor-grab items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 active:cursor-grabbing'
			>
				<Icon data={drag_indicator} size={24} />
			</button>
			{children}
		</Toolbar>
	);
};
