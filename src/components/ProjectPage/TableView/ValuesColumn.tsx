import { useDroppable } from '@dnd-kit/react';
import { cn } from '../../../utils/cn';
import { Issue } from '../ProjectPage';
import { ValueCard } from './ValueCard';
import { CollisionPriority } from '@dnd-kit/abstract';

export const ValuesColumn = ({ issues, className }: ValuesColumnProps) => {
	const { ref } = useDroppable({
		id: 'value',
		type: 'column',
		accept: ['decision', 'uncertainty', 'value', 'fact', 'unassigned'],
		collisionPriority: CollisionPriority.Low,
	});
	return (
		<div className='flex flex-col gap-2'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium'>Values</h3>
				<span className='bg-background-light w-8 rounded-full text-center text-sm'>
					{issues.length}
				</span>
			</div>
			<div ref={ref} className={cn('flex h-full flex-col gap-2 rounded-sm p-2', className)}>
				{issues.map((issue, index) => (
					<ValueCard key={issue.id} issue={issue} index={index} />
				))}
			</div>
		</div>
	);
};

type ValuesColumnProps = {
	issues: Issue[];
	className?: string;
};
