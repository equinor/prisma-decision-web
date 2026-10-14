import { useDroppable } from '@dnd-kit/react';
import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { cn } from '../../../../utils/cn';
import { Issue } from '../../../../validators';
import { DECISION_DRAG_TYPE, DraggableDecisionChip } from './DecisionChip';
import type { DecisionTierConfig } from './DecisionTier';

export const DecisionTierSheet = ({ tier, issues, onClose }: DecisionTierSheetProps) => {
	const { ref, isDropTarget } = useDroppable({
		id: `sheet-${tier.type}`,
		accept: DECISION_DRAG_TYPE,
		data: { type: tier.type },
	});
	return (
		<aside
			aria-label={`All ${tier.title.toLowerCase()} decisions`}
			className='bg-background-default shadow-tile motion-safe:animate-sheet-open flex w-[min(360px,40%)]
				min-w-56 shrink-0 flex-col gap-4 rounded-sm p-6'
		>
			<div className='flex items-center justify-between gap-4'>
				<div className='flex items-center gap-2'>
					<h2 className='text-2xl font-semibold'>{tier.title}</h2>
					<span className='bg-background-light w-8 rounded-full text-center text-sm'>
						{issues.length}
					</span>
				</div>
				<Button variant='ghost_icon' aria-label='Close' onClick={onClose}>
					<Icon data={close} />
				</Button>
			</div>
			<div
				ref={ref}
				className={cn(
					'flex flex-1 flex-wrap content-start gap-3 overflow-auto rounded-sm p-4',
					tier.surfaceClassName,
					isDropTarget && tier.surfaceDropTargetClassName,
				)}
			>
				{issues.map(issue => (
					<DraggableDecisionChip
						key={issue.id}
						issue={issue}
						dragId={`sheet-${issue.id}`}
					/>
				))}
			</div>
		</aside>
	);
};

type DecisionTierSheetProps = {
	tier: DecisionTierConfig;
	issues: Issue[];
	onClose: () => void;
};
