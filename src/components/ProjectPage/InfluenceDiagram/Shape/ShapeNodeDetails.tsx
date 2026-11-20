import { Issue } from '../../../../validators';
import { ShapeNodeState } from './ShapeNodeState';

export const ShapeNodeDetails = ({ issue, tableOpen }: { issue: Issue; tableOpen: boolean }) => {
	if (tableOpen) return null;

	return (
		<div className='pointer-events-none absolute top-full left-1/2 flex w-max -translate-x-1/2 flex-col items-center'>
			<ShapeNodeState />
			{issue.description?.trim() && (
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
