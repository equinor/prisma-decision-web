import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import { cn } from '../../../utils/cn';
import { getCardType } from '../../../utils/getCardType';
import { Issue, IssueType, issueTypes } from '../../../validators';
import { DraggableCard } from '../../common/Cards/DraggableCard';

export const IssueColumn = ({ issueType, issues, className, label }: IssueColumn) => {
	const { ref } = useDroppable({
		id: issueType,
		type: 'column',
		accept: [...issueTypes],
		collisionPriority: CollisionPriority.Low,
	});
	return (
		<div className='flex flex-col gap-2'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium'>{label}</h3>
				<span className='bg-background-light w-8 rounded-full text-center text-sm'>
					{issues.length}
				</span>
			</div>
			<div ref={ref} className={cn('flex h-full flex-col gap-2 rounded-sm p-2', className)}>
				{issues.map((issue, index) => {
					const Card = getCardType(issue.type);
					return (
						<DraggableCard key={issue.id} issue={issue} index={index} type={issueType}>
							<Card issue={issue} />
						</DraggableCard>
					);
				})}
			</div>
		</div>
	);
};

type IssueColumn = {
	issueType: IssueType;
	issues: Issue[];
	className?: string;
	label: string;
};
