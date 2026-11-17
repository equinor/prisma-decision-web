import {
	MenuButton,
	MenuProvider,
	Popover,
	PopoverDisclosure,
	PopoverProvider,
} from '@ariakit/react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { arrow_drop_down, check, warning_outlined } from '@equinor/eds-icons';
import { Fragment, ReactNode } from 'react';
import { cn } from '../../../../utils/cn';
import { ParentTypeIndicator } from '../../../common/ParentTypeIndicator';
import { showErrorToast } from '../../../ShowToast';
import {
	buildModel,
	compareToLeak,
	getBaseline,
	getIncompleteRows,
	isDistribution,
	makeBaseline,
} from './noisyMax';
import { OutcomeOrderList } from './OutcomeOrderList';
import { ProbabilityInput, SumCell } from './ProbabilityTableCells';
import { fixProbabilitySum, isRowValid, ProbabilityCell, toScale } from './probabilityTableMath';
import { TableMenu, TableMenuItem } from './TableMenu';
import { useLiveRebalance } from './useLiveRebalance';
import { NoisyMaxSettings } from './useProbabilityTableSettings';
import { ParentDescriptor } from './utils';

type Outcome = { id: string; name: string };
type RowRef = { issueId: string; stateId: string } | null;

const divider = 'border-t border-(--eds-border-non-interactive-neutral-muted)';
const rowKeyOf = (row: RowRef) => (row ? `${row.issueId}:${row.stateId}` : 'leak');

/** Iteration 2, Parameters view: the leak row plus one row per parent state that isn't the baseline */
export const NoisyMaxParameters = ({
	issueName,
	outcomes,
	order,
	parents,
	settings,
	keepRowsAtOne,
	onChange,
	onOrderChange,
}: {
	issueName: string;
	/** In column order */
	outcomes: Outcome[];
	/** Column indexes low → high */
	order: number[];
	parents: ParentDescriptor[];
	settings: NoisyMaxSettings;
	keepRowsAtOne: boolean;
	onChange: (next: NoisyMaxSettings) => void;
	onOrderChange: (ids: string[]) => void;
}) => {
	const live = useLiveRebalance(keepRowsAtOne);
	const outcomeIds = outcomes.map(outcome => outcome.id);
	const model = buildModel(settings, parents, outcomeIds, order);
	const incomplete = getIncompleteRows(model).length;
	const parameterRowCount =
		1 + parents.reduce((count, parent) => count + Math.max(parent.states.length - 1, 0), 0);

	const recordOf = (row: RowRef) =>
		row ? settings.rows[row.issueId]?.[row.stateId] : settings.leak;
	const cellsOf = (row: RowRef): ProbabilityCell[] =>
		outcomes.map(outcome => ({
			value: recordOf(row)?.[outcome.id] ?? 0,
			locked: false,
			disabled: false,
		}));
	const setRow = (row: RowRef, values: number[]) => {
		const record = Object.fromEntries(outcomeIds.map((id, i) => [id, values[i]]));
		if (!row) return onChange({ ...settings, leak: record });
		onChange({
			...settings,
			rows: {
				...settings.rows,
				[row.issueId]: { ...settings.rows[row.issueId], [row.stateId]: record },
			},
		});
	};

	const renderRow = (row: RowRef, label: string, guidance?: ReactNode) => {
		const key = rowKeyOf(row);
		const cells = cellsOf(row);
		const preview = live.preview(key, cells);
		return (
			<Fragment key={key}>
				<tr>
					<td className='px-1 py-1'>
						<div className='flex h-9 min-w-36 items-center gap-1.5 px-2 whitespace-nowrap'>
							{label}
							{guidance && (
								<Icon
									data={warning_outlined}
									size='sm'
									className='text-(--eds-icon-on-default-warning)'
								/>
							)}
						</div>
					</td>
					{outcomes.map((outcome, index) => (
						<td key={outcome.id} className='px-1 py-1'>
							<ProbabilityInput
								value={preview.values[index]}
								label={`${label}, ${outcome.name}`}
								disabled={false}
								readOnly={false}
								locked={false}
								adjusted={preview.adjusted.has(index)}
								onDraftChange={value => live.draft(key, index, value)}
								onCommit={value =>
									setRow(row, live.commit(key, cells, index, value))
								}
								onContextMenu={() => {}}
							/>
						</td>
					))}
					<td className='px-1 py-1 text-center'>
						<SumCell
							sum={preview.sumCells.reduce((sum, cell) => sum + cell.value, 0)}
							invalidCount={isRowValid(preview.sumCells) ? 0 : 1}
							configurationCount={1}
							outcomes={outcomes.map(outcome => ({
								name: outcome.name,
								available: true,
							}))}
							onFix={fix => {
								const result = fixProbabilitySum(cells, fix);
								if (result.error) return showErrorToast(result.error);
								setRow(
									row,
									result.cells.map(cell => cell.value),
								);
							}}
						/>
					</td>
				</tr>
				{guidance && (
					<tr>
						<td colSpan={outcomes.length + 2} className='px-3 pb-2'>
							<div className='flex w-0 min-w-full flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--eds-text-on-default-warning)'>
								{guidance}
							</div>
						</td>
					</tr>
				)}
			</Fragment>
		);
	};

	const columnCount = outcomes.length + 2;
	const scaleOutcomes = toScale(outcomes, order);

	return (
		<div className='flex min-h-0 flex-col gap-3'>
			<div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--eds-text-secondary)'>
				<span>Outcome order, low → high:</span>
				<span className='text-(--eds-text-primary)'>
					{scaleOutcomes.map(outcome => outcome.name).join(' · ')}
				</span>
				<PopoverProvider placement='bottom-start'>
					<PopoverDisclosure render={<Button variant='ghost' size='small' />}>
						Change
					</PopoverDisclosure>
					<Popover
						portal
						gutter={4}
						className='nodrag nopan nowheel z-[1100] flex w-72 flex-col gap-2 rounded-sm border border-(--eds-color-border-subtle) bg-(--eds-color-bg-floating) p-4 shadow-md outline-none'
						onClick={event => event.stopPropagation()}
						onPointerDown={event => event.stopPropagation()}
						onKeyDown={event => event.stopPropagation()}
					>
						<span className='text-sm font-medium'>Outcome scale order</span>
						<p className='text-xs text-(--eds-text-secondary)'>
							Noisy-MAX needs the outcomes of {issueName} from low to high. A parent
							can only push the outcome up this scale.
						</p>
						<OutcomeOrderList outcomes={scaleOutcomes} onChange={onOrderChange} />
					</Popover>
				</PopoverProvider>
			</div>
			<div className='min-h-0 overflow-auto'>
				<table className='border-collapse text-left text-sm'>
					<thead>
						<tr className='shadow-[inset_0_-1px_0_var(--eds-border-non-interactive-neutral-muted)]'>
							<th className='px-2 py-1 align-bottom leading-5 font-bold'>
								Parent state
							</th>
							{outcomes.map(outcome => (
								<th
									key={outcome.id}
									className='max-w-24 truncate px-2 py-1 align-bottom leading-5 font-bold'
									title={outcome.name}
								>
									{outcome.name}
								</th>
							))}
							<th className='px-2 py-1 align-bottom leading-5 font-bold'>Sum</th>
						</tr>
					</thead>
					<tbody className='border-b border-(--eds-border-non-interactive-neutral-muted)'>
						<tr>
							<td colSpan={columnCount} className='px-3 pt-3'>
								<span className='font-medium'>Leak</span>
								<span className='ml-2 text-xs text-(--eds-text-secondary)'>
									{issueName} when every parent is at its baseline
								</span>
							</td>
						</tr>
						{renderRow(null, 'All at baseline')}
						{parents.map(parent => {
							const baseline = getBaseline(parent, settings.baselines);
							const baselineName =
								parent.states.find(state => state.id === baseline)?.name ?? '–';
							return (
								<Fragment key={parent.issueId}>
									<tr>
										<td
											colSpan={columnCount}
											className={cn(divider, 'px-3 pt-3')}
										>
											<div className='flex items-center gap-3'>
												<span className='flex items-center gap-1.5 font-medium whitespace-nowrap'>
													<ParentTypeIndicator kind={parent.kind} />
													{parent.issueName}
												</span>
												<MenuProvider placement='bottom-start'>
													<MenuButton
														render={
															<Button variant='ghost' size='small' />
														}
														title='The normal state, where this parent does not push the outcome up'
													>
														Baseline: {baselineName}
														<Icon data={arrow_drop_down} size='sm' />
													</MenuButton>
													<TableMenu>
														{parent.states.map(state => (
															<TableMenuItem
																key={state.id}
																onClick={() =>
																	onChange({
																		...settings,
																		baselines: {
																			...settings.baselines,
																			[parent.issueId]:
																				state.id,
																		},
																	})
																}
															>
																{state.name}
																{state.id === baseline && (
																	<Icon data={check} size='sm' />
																)}
															</TableMenuItem>
														))}
													</TableMenu>
												</MenuProvider>
											</div>
										</td>
									</tr>
									{parent.states
										.filter(state => state.id !== baseline)
										.map(state => {
											const values = model.rows[parent.issueId]?.[state.id];
											const comparison =
												values &&
												isDistribution(values) &&
												isDistribution(model.leak)
													? compareToLeak(model.leak, values)
													: 'ok';
											const guidance =
												comparison === 'lower' ? (
													<>
														<span>
															{state.name} keeps {issueName} lower
															than the leak, so this row has no
															effect: a parent can only push the
															outcome up. The baseline should be the
															state that pushes least.
														</span>
														<Button
															variant='ghost'
															size='small'
															onClick={() =>
																onChange(
																	makeBaseline(
																		settings,
																		parent,
																		state.id,
																	),
																)
															}
														>
															Make {state.name} the baseline
														</Button>
													</>
												) : comparison === 'mixed' ? (
													<span>
														{state.name} pushes {issueName} up for some
														outcomes and down for others. Only the
														upward part counts. If parents both raise
														and lower {issueName}, Row by row may fit
														better.
													</span>
												) : undefined;
											return renderRow(
												{ issueId: parent.issueId, stateId: state.id },
												state.name,
												guidance,
											);
										})}
								</Fragment>
							);
						})}
					</tbody>
				</table>
			</div>
			<p className='text-xs text-(--eds-text-secondary)' aria-live='polite'>
				{incomplete
					? `${incomplete} of ${parameterRowCount} rows still need values that sum to 1. The full table is calculated once every row is complete.`
					: `Every row of the full table is calculated from these ${parameterRowCount} rows.`}
			</p>
		</div>
	);
};
