import { useExpandCard } from '../../../../hooks/useExpandCard';
import { cn } from '../../../../utils/cn';
import { Issue } from '../../../../validators';
import { ShapeNodeState } from './ShapeNodeState';

export const ShapeNodeDetails = ({ issue, tableOpen }: { issue: Issue; tableOpen: boolean }) => {
	const { expanded } = useExpandCard(issue.id);
	return (
		<div
			className={cn(
				'[&_ul]:bg-background-default [&_ul]:shadow-tile flex w-max flex-col items-center [&_ul]:mt-2 [&_ul]:w-87.5 [&_ul]:p-2',
				expanded || tableOpen
					? 'relative'
					: 'pointer-events-none absolute top-full left-1/2 -translate-x-1/2',
			)}
		>
			<ShapeNodeState />
			{!expanded && !tableOpen && issue.description?.trim() && (
				<div className='influence-shape-description nodrag nopan nowheel w-80 pt-2'>
					<div
						role='note'
						aria-label={`Description: ${issue.name}`}
						className='rounded-sm border border-(--eds-color-border-neutral-subtle) bg-(--eds-color-bg-floating) px-2 py-1 text-sm leading-5 text-(--eds-color-text-subtle)'
					>
						<p className='line-clamp-2 whitespace-pre-line'>{issue.description}</p>
					</div>
				</div>
			)}
		</div>
	);
};
