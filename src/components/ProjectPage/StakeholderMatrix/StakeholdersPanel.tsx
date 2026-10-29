import { Button, Icon, TextField, Tooltip } from '@equinor/eds-core-react';
import { search, sheet_right_position } from '@equinor/eds-icons';
import type { StakeholderMatrixEntry } from '../../../validators';
import { CreateStakeholderMatrix } from './CreateStakeholderMatrix';
import { DeleteStakeholderMatrixDialog } from './DeleteStakeholderMatrixDialog';
import { EditStakeholderMatrix } from './EditStakeholderMatrix';
import { getRegionKey, stakeholderListOrder, stakeholderRegions } from './stakeholderRegions';

type StakeholdersPanelProps = {
	stakeholders: StakeholderMatrixEntry[];
	isLoading: boolean;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onHide: () => void;
};

export const StakeholdersPanel = ({
	stakeholders,
	isLoading,
	searchQuery,
	onSearchChange,
	onHide,
}: StakeholdersPanelProps) => {
	const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
	const filtered = stakeholders.filter(stakeholder =>
		`${stakeholder.stakeholder_name} ${stakeholder.stakeholder_role}`
			.toLocaleLowerCase()
			.includes(normalizedQuery),
	);

	return (
		<aside className='bg-background-default flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-[#d4d4d4]'>
			<div className='flex items-center gap-2 pt-5 pr-3 pb-3 pl-4'>
				<h2 className='flex-1 text-base font-medium tracking-[0.2px]'>Stakeholders</h2>
				<div className='flex items-center gap-1'>
					<CreateStakeholderMatrix label='Add' />
					<Tooltip title='Hide stakeholder list'>
						<Button
							variant='ghost_icon'
							aria-label='Hide stakeholder list'
							onClick={onHide}
						>
							<Icon data={sheet_right_position} />
						</Button>
					</Tooltip>
				</div>
			</div>
			<div className='h-px shrink-0 bg-[#d4d4d4]' />
			<div className='shrink-0 px-3 py-4'>
				<TextField
					label='Search stakeholders'
					placeholder='Name or role'
					inputIcon={<Icon data={search} />}
					value={searchQuery}
					onChange={event => onSearchChange(event.target.value)}
				/>
			</div>
			<div className='h-px shrink-0 bg-[#d4d4d4]' />
			<div className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2'>
				{stakeholderListOrder.map(regionKey => {
					const region = stakeholderRegions[regionKey];
					const group = filtered
						.filter(
							stakeholder =>
								getRegionKey(
									stakeholder.affecting_the_decision,
									stakeholder.affected_by_the_decision,
								) === regionKey,
						)
						.sort((a, b) => a.stakeholder_name.localeCompare(b.stakeholder_name));
					if (group.length === 0) return null;

					return (
						<section key={regionKey}>
							<div className='bg-background-light flex h-7 items-center gap-2 px-2'>
								<span
									className='size-2.5 rounded-full'
									style={{ backgroundColor: region.accent }}
								/>
								<h3 className='flex-1 text-[10px] font-medium tracking-[1.1px] uppercase'>
									{region.label}
								</h3>
								<span className='text-text-tertiary text-[10px] font-medium'>
									{group.length}
								</span>
							</div>
							{group.map(stakeholder => (
								<div
									key={stakeholder.stakeholder_matrix_id}
									className='hover:bg-background-light flex items-center gap-0.5 rounded-sm px-2 py-1.5'
								>
									<div className='flex min-w-0 flex-1 flex-col gap-0.5 leading-4'>
										<span className='truncate text-sm font-medium'>
											{stakeholder.stakeholder_name}
										</span>
										<span className='text-text-tertiary truncate text-xs font-medium tracking-[0.2px]'>
											{stakeholder.stakeholder_role}
										</span>
										<span className='flex gap-0.5 text-[10px] font-medium'>
											<span className='bg-background-medium rounded-sm px-1.5 py-0.5'>
												Affecting:{' '}
												{stakeholder.affecting_the_decision.toFixed(2)}
											</span>
											<span className='bg-background-medium rounded-sm px-1.5 py-0.5'>
												Affected:{' '}
												{stakeholder.affected_by_the_decision.toFixed(2)}
											</span>
										</span>
									</div>
									<div className='flex shrink-0'>
										<EditStakeholderMatrix stakeholder={stakeholder} />
										<DeleteStakeholderMatrixDialog stakeholder={stakeholder} />
									</div>
								</div>
							))}
						</section>
					);
				})}
				{!isLoading && stakeholders.length === 0 && (
					<p className='text-text-tertiary px-3 py-8 text-center text-sm'>
						Your stakeholder list will appear here.
					</p>
				)}
				{!isLoading && stakeholders.length > 0 && filtered.length === 0 && (
					<p className='text-text-tertiary px-3 py-8 text-center text-sm'>
						No stakeholders match your search.
					</p>
				)}
			</div>
		</aside>
	);
};
