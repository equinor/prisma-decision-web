import { Tooltip } from '@equinor/eds-core-react';
import { Button, Icon, TextField } from '@equinor/eds-core-react/next';
import { search, sheet_right_position } from '@equinor/eds-icons';
import { useSelectedProjectStakeholders } from '../../../hooks/useSelectedProjectStakeholders';
import { CreateStakeholderMatrix } from './CreateStakeholderMatrix';
import { DeleteStakeholderMatrixDialog } from './DeleteStakeholderMatrixDialog';
import { EditStakeholderMatrix } from './EditStakeholderMatrix';
import { getRegionKey, stakeholderListOrder, stakeholderRegions } from './stakeholderRegions';

type StakeholdersPanelProps = {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onHide: () => void;
};

export const StakeholdersPanel = ({
	searchQuery,
	onSearchChange,
	onHide,
}: StakeholdersPanelProps) => {
	const { data: stakeholders, isLoading } = useSelectedProjectStakeholders();
	const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
	const filtered = stakeholders.filter(stakeholder =>
		`${stakeholder.stakeholder_name} ${stakeholder.stakeholder_role}`
			.toLocaleLowerCase()
			.includes(normalizedQuery),
	);

	return (
		<aside
			aria-label='Stakeholders'
			className='dark:border-background-medium dark:bg-background-default flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-(--eds-color-border-subtle) bg-(--eds-color-bg-surface)'
		>
			<div className='flex shrink-0 items-center gap-2 pt-5 pr-3 pb-3 pl-4'>
				<h2 className='flex-1 text-base font-medium tracking-[0.2px]'>Stakeholders</h2>
				<div className='flex items-center gap-1'>
					<CreateStakeholderMatrix label='Add' />
					<Tooltip title='Hide stakeholder list'>
						<Button
							icon
							variant='ghost'
							className='size-8'
							aria-label='Hide stakeholder list'
							aria-pressed
							onClick={onHide}
						>
							<Icon data={sheet_right_position} />
						</Button>
					</Tooltip>
				</div>
			</div>
			<div className='dark:bg-background-medium h-px shrink-0 bg-(--eds-color-border-subtle)' />
			<div className='shrink-0 px-3 py-4'>
				<TextField
					className='w-full [&>.header]:min-h-4.5'
					label='Search stakeholders'
					placeholder='Name or role'
					startAdornment={<Icon data={search} />}
					value={searchQuery}
					onChange={event => onSearchChange(event.target.value)}
				/>
			</div>
			<div className='dark:bg-background-medium h-px shrink-0 bg-(--eds-color-border-subtle)' />
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
						<section key={regionKey} className='shrink-0'>
							<div className='dark:bg-background-light flex h-7 items-center gap-2 bg-(--eds-color-bg-canvas) px-2'>
								<span
									className='size-2.5 shrink-0 rounded-full'
									style={{ backgroundColor: region.accent }}
								/>
								<h3 className='flex-1 text-[10px] leading-4 font-medium tracking-[1.1px] uppercase'>
									{region.label}
								</h3>
								<span className='dark:text-text-tertiary text-[10px] leading-4 font-medium text-(--eds-color-text-subtle)'>
									{group.length}
								</span>
							</div>
							{group.map(stakeholder => (
								<div
									key={stakeholder.stakeholder_matrix_id}
									className='dark:hover:bg-background-light flex h-20 items-center gap-0.5 rounded px-2 py-1.5 hover:bg-(--eds-color-bg-canvas)'
								>
									<div className='flex h-17 min-w-0 flex-1 flex-col gap-0.5 leading-4'>
										<span className='truncate text-sm leading-4 font-medium'>
											{stakeholder.stakeholder_name}
										</span>
										<span className='dark:text-text-tertiary truncate text-xs font-medium tracking-[0.2px] text-(--eds-color-text-subtle)'>
											{stakeholder.stakeholder_role}
										</span>
										<span className='flex gap-0.5 text-xs font-medium whitespace-nowrap'>
											<span className='dark:bg-background-medium inline-flex h-4.5 items-center rounded bg-(--eds-color-bg-fill-muted-default) px-1.5'>
												Affecting:{' '}
												{stakeholder.affecting_the_decision.toFixed(2)}
											</span>
											<span className='dark:bg-background-medium inline-flex h-4.5 items-center rounded bg-(--eds-color-bg-fill-muted-default) px-1.5'>
												Affected:{' '}
												{stakeholder.affected_by_the_decision.toFixed(2)}
											</span>
										</span>
									</div>
									<div className='flex shrink-0 gap-0.5'>
										<EditStakeholderMatrix stakeholder={stakeholder} />
										<DeleteStakeholderMatrixDialog stakeholder={stakeholder} />
									</div>
								</div>
							))}
						</section>
					);
				})}
				{!isLoading && stakeholders.length === 0 && (
					<p className='dark:text-text-tertiary px-3 py-8 text-center text-sm text-(--eds-color-text-subtle)'>
						Your stakeholder list will appear here.
					</p>
				)}
				{!isLoading && stakeholders.length > 0 && filtered.length === 0 && (
					<p className='dark:text-text-tertiary px-3 py-8 text-center text-sm text-(--eds-color-text-subtle)'>
						No stakeholders match your search.
					</p>
				)}
			</div>
		</aside>
	);
};
