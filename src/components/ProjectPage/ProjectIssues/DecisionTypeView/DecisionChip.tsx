import { useDraggable } from '@dnd-kit/react';
import { Ref, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { Issue } from '../../../../validators';
import { EditIssueModal } from '../../../common/EditIssueModal';

export const DECISION_DRAG_TYPE = 'decision';

export const decisionChipClassName =
	'shadow-raised bg-background-default text-text-default block h-9 max-w-60 shrink-0 truncate rounded-sm p-2 text-base leading-5 font-bold whitespace-nowrap';

export const DecisionChip = ({
	issue,
	className,
	ref,
}: {
	issue: Issue;
	className?: string;
	ref?: Ref<HTMLButtonElement>;
}) => {
	const [editOpen, setEditOpen] = useState(false);
	return (
		<>
			<button
				ref={ref}
				type='button'
				title={issue.name}
				onClick={() => setEditOpen(true)}
				className={cn(
					decisionChipClassName,
					'hover:bg-background-light cursor-pointer',
					className,
				)}
			>
				{issue.name}
			</button>
			<EditIssueModal issue={issue} open={editOpen} onClose={() => setEditOpen(false)} />
		</>
	);
};

export const DraggableDecisionChip = ({ issue, dragId }: { issue: Issue; dragId?: string }) => {
	const { ref, isDragging } = useDraggable({
		id: dragId ?? issue.id,
		type: DECISION_DRAG_TYPE,
		data: { issue },
	});
	return <DecisionChip ref={ref} issue={issue} className={cn(isDragging && 'opacity-40')} />;
};
