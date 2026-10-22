import { useSortable } from '@dnd-kit/react/sortable';
import { Issue } from '../../validators';

export const DraggableIssueContainer = ({
	issue,
	index,
	columnId,
	accept,
	children,
}: DraggableCardProps) => {
	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type: columnId,
		data: {
			issue,
		},
		accept,
		group: columnId,
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
	columnId: string;
	accept: string[];
	children: React.ReactNode;
};
