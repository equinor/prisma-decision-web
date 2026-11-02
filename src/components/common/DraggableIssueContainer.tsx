import { useSortable } from '@dnd-kit/react/sortable';
import { Issue, IssueType, issueTypes } from '../../validators';

export const DraggableIssueContainer = ({
	issue,
	index,
	type,
	acceptedTypes = issueTypes,
	children,
	disabled = false,
}: DraggableCardProps) => {
	const { ref, isDragging } = useSortable({
		id: issue.id,
		index,
		type,
		data: {
			issue,
			editing: disabled,
		},
		accept: [...acceptedTypes],
		group: type,
	});
	return (
		<div
			ref={ref}
			data-dragging={isDragging}
			data-no-dnd={disabled || undefined}
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
	type: IssueType | string;
	acceptedTypes?: readonly string[];
	children: React.ReactNode;
	disabled?: boolean;
};
