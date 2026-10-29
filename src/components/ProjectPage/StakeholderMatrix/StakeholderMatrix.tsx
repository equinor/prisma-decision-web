import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { info_circle, sheet_right_position } from '@equinor/eds-icons';
import { useLocalStorage, useMediaQuery } from '@uidotdev/usehooks';
import { useState } from 'react';
import { useGetStakeholderMatrixes } from '../../../hooks/api/useGetStakeholderMatrixes';
import { useUpdateStakeholderMatrix } from '../../../hooks/api/useUpdateStakeholderMatrix';
import type { StakeholderMatrixEntry } from '../../../validators';
import { cn } from '../../../utils/cn';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useSelectedProject } from '../ProjectContext';
import { CreateStakeholderMatrix } from './CreateStakeholderMatrix';
import { StakeholderGrid } from './StakeholderGrid';
import { StakeholdersPanel } from './StakeholdersPanel';

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

	const { data: stakeholderMatrices, isLoading } = useGetStakeholderMatrixes();
	const projectId = useSelectedProject().id;
	const stakeholders = stakeholderMatrices.filter(matrix => matrix.project_id === projectId);
	const { mutate: updateStakeholder } = useUpdateStakeholderMatrix();

	const handleStakeholderMove = (
		id: string,
		values: Pick<StakeholderMatrixEntry, 'affecting_the_decision' | 'affected_by_the_decision'>,
	) => {
		const stakeholder = stakeholders.find(current => current.stakeholder_matrix_id === id);
		if (!stakeholder) return;
		updateStakeholder({ ...stakeholder, ...values });
	};

	return (
		<div className={cn('flex h-[calc(100dvh-144px)] min-h-0 w-full', className)}>
			<div className='flex min-h-0 min-w-0 flex-1 flex-col'>
				<header className='flex shrink-0 items-center justify-between gap-5 px-6 pt-6 pb-4'>
					<div className='flex items-center gap-2'>
						<h1 className='text-[32px] leading-10 font-bold whitespace-nowrap'>
							Stakeholder Matrix
						</h1>
						<span className='bg-background-medium rounded-sm px-2 py-1.5 text-xs leading-4 font-medium whitespace-nowrap'>
							{stakeholders.length}{' '}
							{stakeholders.length === 1 ? 'stakeholder' : 'stakeholders'}
						</span>
						<Tooltip title={ABOUT_TEXT}>
							<Button variant='ghost_icon' aria-label='About this view'>
								<Icon data={info_circle} />
							</Button>
						</Tooltip>
					</div>
					{!isListOpen && (
						<div className='flex items-center gap-1'>
							<CreateStakeholderMatrix />
							<Tooltip title='Show stakeholder list'>
								<Button
									variant='ghost_icon'
									aria-label='Show stakeholder list'
									onClick={() => setListOpen(true)}
								>
									<Icon data={sheet_right_position} />
								</Button>
							</Tooltip>
						</div>
					)}
				</header>
				<div className='relative flex min-h-0 flex-1 flex-col py-4 pr-6 pl-4'>
					<StakeholderGrid
						stakeholders={stakeholders}
						onStakeholderMove={handleStakeholderMove}
					/>
					{isLoading && <LoadingSpinner />}
				</div>
			</div>
			{isListOpen && (
				<StakeholdersPanel
					stakeholders={stakeholders}
					isLoading={isLoading}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onHide={() => setListOpen(false)}
				/>
			)}
		</div>
	);
};

export default StakeholderMatrix;
