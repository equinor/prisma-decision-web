import { useDroppable } from '@dnd-kit/react';
import { cn } from '../../../utils/cn';
import { UnassignedCard } from './UnassignedCard';
import { CollisionPriority } from '@dnd-kit/abstract';
import { Issue, issueTypes } from '../../../validators';

export const UnassignedColumn = ({ issues, className }: UnassignedColumn) => {
	const { ref } = useDroppable({
		id: 'Unassigned',
		type: 'column',
		accept: [...issueTypes],
		collisionPriority: CollisionPriority.Low,
	});
	return (
		<div className='flex flex-col gap-2'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium'>Unassigned</h3>
				<span className='bg-background-light w-8 rounded-full text-center text-sm'>
					{issues.length}
				</span>
			</div>
			<div ref={ref} className={cn('flex h-full flex-col gap-2 rounded-sm p-2', className)}>
				{issues.map((issue, index) => (
					<UnassignedCard key={issue.id} issue={issue} index={index} />
				))}
			</div>
		</div>
	);
};

type UnassignedColumn = {
	issues: Issue[];
	className?: string;
};
