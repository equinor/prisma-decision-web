import { useSortable } from '@dnd-kit/react/sortable';
import { Issue, IssueType, issueTypes } from '../../../validators';

export const DraggableCard = ({ issue, index, type, children }: DraggableCardProps) => {
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
			className='w-full data-[dragging="true"]:cursor-grabbing
			data-[dragging="true"]:opacity-40 data-[dragging="true"]:outline-1'
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
