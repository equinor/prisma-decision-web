import { useDroppable } from '@dnd-kit/react';
import { cn } from '../../../utils/cn';
import { UncertaintieCard } from './UncertaintieCard';
import { CollisionPriority } from '@dnd-kit/abstract';
import { Issue, issueTypes } from '../../../validators';

export const UncertaintiesColumn = ({ issues, className }: UncertaintiesColumn) => {
	const { ref } = useDroppable({
		id: 'Uncertainty',
		type: 'column',
		accept: [...issueTypes],
		collisionPriority: CollisionPriority.Low,
	});
	return (
		<div className='flex flex-col gap-2'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium'>Uncertainties</h3>
				<span className='bg-background-light w-8 rounded-full text-center text-sm'>
					{issues.length}
				</span>
			</div>
			<div ref={ref} className={cn('flex h-full flex-col gap-2 rounded-sm p-2', className)}>
				{issues.map((issue, index) => (
					<UncertaintieCard key={issue.id} issue={issue} index={index} />
				))}
			</div>
		</div>
	);
};

type UncertaintiesColumn = {
	issues: Issue[];
	className?: string;
};
