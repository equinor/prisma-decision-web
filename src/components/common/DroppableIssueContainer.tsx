import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';

export const DroppableIssueContainer = ({
	columnId,
	accept,
	children,
	className,
}: DroppableIssueContainerProps) => {
	const { ref } = useDroppable({
		id: columnId,
		type: 'column',
		accept,
		collisionPriority: CollisionPriority.Low,
	});
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
};
type DroppableIssueContainerProps = {
	columnId: string;
	accept: string[];
	children: React.ReactNode;
	className?: string;
};
