import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import { issueTypes, IssueType } from '../../validators';

export const DroppableIssueContainer = ({
	issueType,
	children,
	className,
}: DroppableIssueContainerProps) => {
	const { ref } = useDroppable({
		id: issueType,
		type: 'column',
		accept: [...issueTypes],
		collisionPriority: CollisionPriority.Low,
	});
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
};
type DroppableIssueContainerProps = {
	issueType: IssueType;
	children: React.ReactNode;
	className?: string;
};
