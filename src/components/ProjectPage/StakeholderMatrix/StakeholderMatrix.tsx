import '@xyflow/react/dist/style.css';
import { useState } from 'react';
import { CreateStakeholderMatrix } from './CreateStakeholderMatrix';
import { StakeholderGrid } from './StakeholderGrid';
import { StakeholdersPanel } from './StakeholdersPanel';
import { Button, Icon, Tooltip } from '@equinor/eds-core-react/next';
import { info_circle, sheet_right_position } from '@equinor/eds-icons';
import { useLocalStorage, useMediaQuery } from '@uidotdev/usehooks';
import { useSelectedProjectStakeholders } from '../../../hooks/useSelectedProjectStakeholders';
import { cn } from '../../../utils/cn';

type StakeholderMatrixProps = {
	className?: string;
};

const ABOUT_TEXT =
	'Assess how much a stakeholder affects the decision and how strongly the decision affects them.';

export const StakeholderMatrix = ({ className }: StakeholderMatrixProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const isWide = useMediaQuery('(min-width: 1280px)');
	// Below 1280 px the list starts hidden unless the user has a remembered choice.
	const [storedListOpen, setListOpen] = useLocalStorage<boolean | null>(
		'stakeholderListOpen',
		null,
	);
	const isListOpen = storedListOpen ?? isWide;

	const { data: stakeholders } = useSelectedProjectStakeholders();

	return (
		<div
			className={cn(
				'dark:bg-background-light dark:text-text-default absolute inset-0 flex min-h-0 min-w-0 overflow-hidden bg-(--eds-color-bg-surface) text-(--eds-color-text-strong)',
				className,
			)}
		>
			<div className='flex min-h-0 min-w-0 flex-1 flex-col'>
				<header className='flex shrink-0 items-center justify-between gap-5 px-6 pt-6 pb-4'>
					<div className='flex items-center gap-2'>
						<h1 className='text-[32px] leading-10 font-bold whitespace-nowrap'>
							Stakeholder Matrix
						</h1>
						<span className='dark:bg-background-medium flex h-6.5 min-w-29.5 shrink-0 items-center justify-center rounded bg-(--eds-color-bg-fill-muted-default) px-2 text-xs leading-4 font-medium whitespace-nowrap'>
							{stakeholders.length}{' '}
							{stakeholders.length === 1 ? 'stakeholder' : 'stakeholders'}
						</span>
						<Tooltip title={ABOUT_TEXT}>
							<Button
								icon
								variant='ghost'
								tone='neutral'
								size='small'
								aria-label='About this view'
							>
								<Icon data={info_circle} />
							</Button>
						</Tooltip>
					</div>
					{!isListOpen && (
						<div className='flex items-center gap-1'>
							<CreateStakeholderMatrix />
							<Tooltip title='Show stakeholder list'>
								<Button
									icon
									variant='ghost'
									className='size-8'
									aria-label='Show stakeholder list'
									aria-pressed={false}
									onClick={() => setListOpen(true)}
								>
									<Icon data={sheet_right_position} />
								</Button>
							</Tooltip>
						</div>
					)}
				</header>
				<div className='relative flex min-h-0 flex-1 flex-col py-4 pr-6 pl-4'>
					<StakeholderGrid />
				</div>
			</div>
			{isListOpen && (
				<StakeholdersPanel
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onHide={() => setListOpen(false)}
				/>
			)}
		</div>
	);
};

export default StakeholderMatrix;
