import { Popover } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { arrow_drop_down } from '@equinor/eds-icons';
import { useId, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { IssueCardStates } from '../../../common/Cards/IssueCard';
import { useIssueCardContext } from '../../../common/Cards/useIssueCardContext';

export const ShapeNodeState = () => {
	const { issue, selectedState, sortedStates } = useIssueCardContext();
	const [open, setOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const triggerId = useId();
	const contentId = `${triggerId}-states`;
	if (issue.type !== 'Decision' && issue.type !== 'Uncertainty') return null;

	const label = issue.type === 'Decision' ? 'Forced decision' : 'Hard evidence';

	return (
		<>
			<div
				className={cn(
					'nodrag nopan nowheel order-first flex justify-center self-center px-2 pb-2',
					selectedState ? '-mt-2.5 -mb-2' : '-mb-2 pt-2',
					selectedState || open ? 'pointer-events-auto' : 'influence-shape-control',
				)}
				onClick={event => event.stopPropagation()}
			>
				<Button
					ref={setAnchorEl}
					id={triggerId}
					variant='secondary'
					size='small'
					tone={selectedState ? 'accent' : 'neutral'}
					aria-label={`${label}: ${issue.name}`}
					aria-haspopup='dialog'
					aria-expanded={open}
					aria-controls={contentId}
					onClick={() => setOpen(previous => !previous)}
					className='h-auto! max-w-80 rounded-full! bg-(--eds-color-bg-floating)! px-3! py-0.5! text-sm!'
				>
					<span
						className={
							selectedState
								? 'min-w-0 wrap-anywhere whitespace-normal'
								: 'whitespace-nowrap'
						}
					>
						{selectedState?.name ??
							`${sortedStates.length} ${sortedStates.length === 1 ? 'state' : 'states'}`}
					</span>
					<Icon data={arrow_drop_down} size='sm' className='shrink-0' />
				</Button>
			</div>
			<Popover
				open={open}
				id={contentId}
				role='dialog'
				aria-labelledby={triggerId}
				anchorEl={anchorEl}
				placement='bottom'
				onClose={() => setOpen(false)}
				onClick={event => event.stopPropagation()}
				className='nodrag nopan nowheel pointer-events-auto'
			>
				<Popover.Content className='max-h-[50vh] w-[min(350px,90vw)] overflow-y-auto p-2! [&_ul]:mb-0 [&_ul]:pt-0'>
					<IssueCardStates expandedProp />
				</Popover.Content>
			</Popover>
		</>
	);
};
