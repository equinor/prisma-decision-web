import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import { issueTypes, IssueType } from '../../validators';

export const DroppableIssueContainer = ({
	issueType,
	id = issueType,
	acceptedTypes = issueTypes,
	children,
	className,
}: DroppableIssueContainerProps) => {
	const { ref } = useDroppable({
		id,
		type: 'column',
		accept: [...acceptedTypes],
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
	id?: string;
	acceptedTypes?: readonly string[];
	children: React.ReactNode;
	className?: string;
};
