import { useSortable } from '@dnd-kit/react/sortable';
import { Issue, IssueType, issueTypes } from '../../validators';

export const DraggableIssueContainer = ({ issue, index, type, children }: DraggableCardProps) => {
	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type,
		data: {
			issue,
		},
		accept: [...issueTypes],
		group: type,
	});
	return (
		<div
			ref={ref}
			data-dragging={isDragging}
			className='data-[dragging="true"]:cursor-grabbing
			data-[dragging="true"]:opacity-40'
		>
			{children}
		</div>
	);
};

type DraggableCardProps = {
	issue: Issue;
	index: number;
	type: IssueType;
	children: React.ReactNode;
};
