import { useDroppable } from '@dnd-kit/react';
import { Icon } from '@equinor/eds-core-react';
import { thumb_pin } from '@equinor/eds-icons';
import { cn } from '../../../../utils/cn';

export const ToolbarOverlay = () => {
	const { ref: droppableTopRef, isDropTarget: isDropTargetTop } = useDroppable({
		id: 'top',
	});

	const { ref: droppableBottomRef, isDropTarget: isDropTargetBottom } = useDroppable({
		id: 'bottom',
	});

	return (
		<div className='absolute inset-0 z-100 bg-gray-400/50'>
			<div
				className={cn(
					`bg-background-default shadow-tile absolute top-12 left-1/2
					flex h-12 w-120 -translate-x-1/2 items-center justify-center rounded-sm`,
					{
						'opacity-50': !isDropTargetTop,
					},
				)}
				ref={droppableTopRef}
			>
				<Icon data={thumb_pin} className='fill-primary-resting' />
			</div>
			<div
				className={cn(
					`bg-background-default shadow-tile absolute bottom-12 left-1/2
					flex h-12 w-120 -translate-x-1/2 items-center justify-center rounded-sm`,
					{
						'opacity-50': !isDropTargetBottom,
					},
				)}
				ref={droppableBottomRef}
			>
				<Icon data={thumb_pin} className='fill-primary-resting' />
			</div>
		</div>
	);
};
