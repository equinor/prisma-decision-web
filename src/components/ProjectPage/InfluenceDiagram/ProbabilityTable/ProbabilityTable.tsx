import { useMenuStore } from '@ariakit/react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { chevron_down, chevron_right, close } from '@equinor/eds-icons';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useBulkUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { cn } from '../../../../utils/cn';
import { isDevelopment } from '../../../../utils/getEnvironment';
import { getRestrictedOutcomeIds } from '../../../../utils/getProbabilityRestrictions';
import { DiscreteProbability, Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { ParentTypeIndicator } from '../../../common/ParentTypeIndicator';
import { SegmentedSelector } from '../../../common/SegmentedSelector';
import { showErrorToast } from '../../../ShowToast';
import { DefinitionEditor, DefinitionRequest } from './DefinitionEditor';
import { ConfirmBanner, FillToolbar, KeepRowsAtOneSwitch } from './FillToolbar';
import {
	applyRestrictions,
	buildModel,
	calculateConfiguration,
	getIncompleteRows,
	startNoisyMax,
} from './noisyMax';
import { NoisyMaxParameters } from './NoisyMaxParameters';
import { MIXED, SharedValue } from './probabilityFormat';
import { DefinitionButton, ProbabilityInput, SumCell } from './ProbabilityTableCells';
import {
	Definition,
	definitionLabel,
	definitionsEqual,
	fixProbabilitySum,
	formatDefinition,
	fromScale,
	getDefinitionProbabilities,
	isRowValid,
	migrateDefinition,
	NonManualDefinition,
	ProbabilityCell,
	resolveScaleOrder,
	rowSum,
	SumFix,
} from './probabilityTableMath';
import { buildDisplayRows, TreeConfiguration } from './probabilityTableTree';
import { TableMenu, TableMenuItem } from './TableMenu';
import { useLiveRebalance } from './useLiveRebalance';
import { useProbablityTable } from './useProbablityTable';
import { NoisyMaxSettings, useProbabilityTableSettings } from './useProbabilityTableSettings';
import { getParentLabel, getParentStateId } from './utils';

type Configuration = TreeConfiguration & {
	records: (DiscreteProbability | undefined)[];
	cells: ProbabilityCell[];
	definition: Definition;
};
type Update = { configuration: Configuration; values: number[]; definition?: Definition };
type DefinitionState = DefinitionRequest & {
	targets: Configuration[];
	/** Opened from the "Set all rows to" toolbar */
	fillAll?: boolean;
};
type SharedCell = { value: SharedValue; disabled: boolean; locked: boolean; readOnly: boolean };
type CellMenu = {
	x: number;
	y: number;
	targets: Configuration[];
	index: number;
	anchor: HTMLElement;
};
type Pending =
	| { kind: 'fill'; definition: NonManualDefinition; scaleOrder: string[]; filled: number }
	| { kind: 'noisy'; filled: number };

const MANUAL: Definition = { type: 'Manual' };
const divider = 'border-t border-(--eds-border-non-interactive-neutral-muted)';
// Collapsed table borders don't travel with sticky cells, so the header line is an inset shadow
const stickyHeader =
	'sticky top-0 z-10 bg-background-default shadow-[inset_0_-1px_0_var(--eds-border-non-interactive-neutral-muted)]';

const measureHeader = (header: HTMLTableSectionElement | null) => {
	const scroller = header?.closest<HTMLElement>('.overflow-auto');
	if (!header || !scroller) return;
	const observer = new ResizeObserver(() =>
		scroller.style.setProperty('--pt-header', `${header.offsetHeight}px`),
	);
	observer.observe(header);
	return () => observer.disconnect();
};

const getRandomProbabilities = (count: number): number[] => {
	const cutPoints = Array.from({ length: Math.max(0, count - 1) }, () =>
		Math.floor(Math.random() * 101),
	).sort((first, second) => first - second);
	const boundaries = [0, ...cutPoints, 100];
	return boundaries.slice(1).map((boundary, index) => (boundary - boundaries[index]) / 100);
};

const getSharedCell = (targets: Configuration[], index: number): SharedCell => {
	const enabled = targets.filter(target => !target.cells[index].disabled);
	if (!enabled.length) return { value: 0, disabled: true, locked: false, readOnly: false };
	const first = enabled[0].cells[index].value;
	return {
		value: enabled.every(target => target.cells[index].value === first) ? first : MIXED,
		disabled: false,
		locked: enabled.every(target => target.cells[index].locked),
		readOnly: enabled.every(target => target.definition.type !== 'Manual'),
	};
};

const describeDefinitions = (targets: Configuration[]) => {
	const first = targets[0].definition;
	return targets.every(target => definitionsEqual(target.definition, first))
		? { label: definitionLabel(first), detail: formatDefinition(first), shared: first }
		: {
				label: 'Mixed',
				detail: 'The rows in this group have different definitions',
				shared: undefined,
			};
};

const hasValues = (configuration: Configuration) =>
	configuration.cells.some(cell => !cell.disabled && cell.value !== 0);

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const ProbabilityTable = ({
	issue,
	selected,
	onClose,
	ref,
	embedded,
}: ProbabilityTableProps) => {
	const { childOutcomes, parents, rows, lookups, restrictedEntries } = useProbablityTable(issue);
	const { mutate: updateProbabilities, isPending } = useBulkUpdateDiscreteProbabilities();
	const [settings, updateSettings] = useProbabilityTableSettings(issue.id);
	const [cellMenu, setCellMenu] = useState<CellMenu | null>(null);
	const [definitionRequest, setDefinitionRequest] = useState<DefinitionState | null>(null);
	const [pending, setPending] = useState<Pending | null>(null);
	const live = useLiveRebalance(settings.keepRowsAtOne);
	const fieldId = useId();
	const noisy = settings.noisyMax?.enabled ? settings.noisyMax : undefined;
	const outcomeIds = useMemo(() => childOutcomes.map(outcome => outcome.id), [childOutcomes]);
	const order = useMemo(
		() => resolveScaleOrder(outcomeIds, settings.outcomeOrder),
		[outcomeIds, settings.outcomeOrder],
	);
	const scaleOrderIds = order.map(index => outcomeIds[index]);
	const cellMenuStore = useMenuStore({
		open: !!cellMenu,
		setOpen: open => !open && setCellMenu(null),
		placement: 'bottom-start',
	});

	const configurations = useMemo<Configuration[]>(() => {
		const outcomeIds = childOutcomes.map(outcome => outcome.id);
		return rows.map(row => {
			const first = row.values[0];
			const restricted = getRestrictedOutcomeIds(first, outcomeIds, restrictedEntries);
			const locked = new Set(settings.locks[row.rowKey] ?? []);
			const records = childOutcomes.map(outcome =>
				row.values.find(value => value.outcome_id === outcome.id),
			);
			return {
				key: row.rowKey,
				path: parents.map(parent => getParentStateId(first, parent)),
				labels: parents.map(parent => getParentLabel(first, parent, lookups)),
				records,
				cells: childOutcomes.map((outcome, index) => ({
					value: records[index]?.probability ?? 0,
					locked: locked.has(outcome.id),
					disabled: restricted.has(outcome.id) || !records[index],
				})),
				definition: migrateDefinition(
					settings.definitions[row.rowKey] ?? MANUAL,
					childOutcomes.length,
				),
			};
		});
	}, [childOutcomes, rows, parents, lookups, restrictedEntries, settings]);

	const collapsed = useMemo(() => new Set(settings.collapsed), [settings.collapsed]);
	const displayRows = useMemo(
		() => buildDisplayRows(configurations, parents.length, collapsed),
		[configurations, parents.length, collapsed],
	);
	const scrollerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		let frame = 0;
		// Labels sit centred in their group and stick under the header once scrolled past;
		// while a group's centre is still below the view, the label moves to the group's top.
		const update = () => {
			frame = 0;
			const view = scroller.getBoundingClientRect();
			// The diagram scales the table, but transforms are in unscaled pixels
			const scale = view.height / scroller.offsetHeight || 1;
			const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			scroller.querySelectorAll<HTMLElement>('[data-group-label]').forEach(label => {
				const cell = label.getBoundingClientRect();
				const pin = (cell.top + cell.bottom) / 2 > view.bottom ? 'top' : 'center';
				const previous = label.dataset.pin;
				if (previous === pin) return;
				const text = label.firstElementChild as HTMLElement | null;
				const before = text?.getBoundingClientRect().top;
				label.dataset.pin = pin;
				if (!previous || !text || before === undefined || !animate) return;
				const offset = (before - text.getBoundingClientRect().top) / scale;
				if (Math.abs(offset) < 1) return;
				text.animate(
					[{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0)' }],
					{ duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
				);
			});
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		scroller.addEventListener('scroll', schedule, { passive: true });
		const observer = new ResizeObserver(schedule);
		observer.observe(scroller);
		return () => {
			cancelAnimationFrame(frame);
			scroller.removeEventListener('scroll', schedule);
			observer.disconnect();
		};
	}, [displayRows, settings.noisyMax?.enabled, settings.noisyMax?.view]);

	const save = (updates: Update[], locks?: (key: string) => string[] | undefined) => {
		const records = updates.flatMap(({ configuration, values }) =>
			configuration.records.flatMap((record, index) =>
				record && record.probability !== values[index]
					? [{ ...record, probability: values[index] }]
					: [],
			),
		);
		if (records.length) updateProbabilities(records);
		updateSettings(previous => {
			const definitions = { ...previous.definitions };
			const nextLocks = { ...previous.locks };
			updates.forEach(({ configuration, definition }) => {
				if (!definition) return;
				if (definition.type === 'Manual') delete definitions[configuration.key];
				else definitions[configuration.key] = definition;
				const locked = locks?.(configuration.key);
				if (locked) nextLocks[configuration.key] = locked;
			});
			return { ...previous, definitions, locks: nextLocks };
		});
	};

	/** force: also locked cells, and no rebalancing (Clear cell) */
	const setCell = (
		rowKey: string,
		targets: Configuration[],
		index: number,
		value: number,
		force = false,
	) =>
		save(
			targets
				.filter(target => !target.cells[index].disabled)
				.filter(target => force || !target.cells[index].locked)
				.map(configuration => ({
					configuration,
					values: force
						? configuration.cells.map((cell, cellIndex) =>
								cellIndex === index ? value : cell.value,
							)
						: live.commit(rowKey, configuration.cells, index, value),
					definition: MANUAL,
				})),
		);

	const setManual = (targets: Configuration[]) =>
		save(
			targets
				.filter(target => target.definition.type !== 'Manual')
				.map(configuration => ({
					configuration,
					values: configuration.cells.map(cell => cell.value),
					definition: MANUAL,
				})),
		);

	const clearRows = (targets: Configuration[]) =>
		save(
			targets.map(configuration => ({
				configuration,
				values: configuration.cells.map(() => 0),
				definition: MANUAL,
			})),
		);

	const applyFix = (targets: Configuration[], fix: SumFix) => {
		const results = targets
			.filter(target => !isRowValid(target.cells))
			.map(configuration => ({
				configuration,
				result: fixProbabilitySum(configuration.cells, fix),
			}));
		const fixed = results.filter(({ result }) => !result.error);
		const failed = results.filter(({ result }) => result.error);
		save(
			fixed.map(({ configuration, result }) => ({
				configuration,
				values: result.cells.map(cell => cell.value),
				definition: MANUAL,
			})),
		);
		if (failed.length)
			showErrorToast(
				fixed.length
					? `Fixed ${fixed.length}; ${failed.length} could not be fixed. ${failed[0].result.error}`
					: (failed[0].result.error ?? 'Could not fix the sum.'),
			);
	};

	/**
	 * A new scale order also recalculates every other row that has a definition, so all rows
	 * keep using the same outcome scale.
	 */
	const applyDefinition = (
		targets: Configuration[],
		definition: NonManualDefinition,
		nextOrderIds = scaleOrderIds,
	) => {
		const nextOrder = resolveScaleOrder(outcomeIds, nextOrderIds);
		const orderChanged = nextOrder.join() !== order.join();
		// Targets can come from an earlier render (an open editor); use the current rows
		const targetKeys = new Set(targets.map(target => target.key));
		const current = configurations.filter(configuration => targetKeys.has(configuration.key));
		const others = orderChanged
			? configurations.filter(
					configuration =>
						!targetKeys.has(configuration.key) &&
						configuration.definition.type !== 'Manual',
				)
			: [];
		const results = [
			...current.map(configuration => ({ configuration, definition })),
			...others.map(configuration => ({
				configuration,
				definition: configuration.definition as NonManualDefinition,
			})),
		].map(({ configuration, definition }) => ({
			configuration,
			definition,
			result: getDefinitionProbabilities(
				definition,
				configuration.cells.map(cell => cell.disabled),
				nextOrder,
			),
		}));
		const failed = results.find(({ result }) => 'error' in result);
		if (failed && 'error' in failed.result) {
			showErrorToast(failed.result.error);
			return;
		}
		save(
			results.map(({ configuration, definition, result }) => ({
				configuration,
				values: 'values' in result ? result.values : [],
				definition,
			})),
			() => [],
		);
		if (orderChanged) updateSettings(previous => ({ ...previous, outcomeOrder: nextOrderIds }));
		setDefinitionRequest(null);
	};

	const fillAll = (definition: NonManualDefinition, nextOrderIds: string[], onlyEmpty: boolean) =>
		applyDefinition(
			onlyEmpty
				? configurations.filter(configuration => !hasValues(configuration))
				: configurations,
			definition,
			nextOrderIds,
		);

	const onDefinitionApply = (
		request: DefinitionState,
		definition: NonManualDefinition,
		nextOrderIds: string[],
	) => {
		if (!request.fillAll) return applyDefinition(request.targets, definition, nextOrderIds);
		// Filling every row never silently replaces values someone typed
		const filled = configurations.filter(hasValues).length;
		if (!filled) return fillAll(definition, nextOrderIds, false);
		setDefinitionRequest(null);
		setPending({ kind: 'fill', definition, scaleOrder: nextOrderIds, filled });
	};

	const noisyParents = useMemo(
		() => parents.map(parent => ({ issueId: parent.issueId, states: parent.states })),
		[parents],
	);

	/** Stores the parameters and, once every parameter row is complete, recalculates every row */
	const recalculateNoisyMax = (next: NoisyMaxSettings, nextOrderIds = scaleOrderIds) => {
		updateSettings(previous => ({ ...previous, noisyMax: next, outcomeOrder: nextOrderIds }));
		if (!next.enabled) return;
		const nextOrder = resolveScaleOrder(outcomeIds, nextOrderIds);
		const model = buildModel(next, noisyParents, outcomeIds, nextOrder);
		if (getIncompleteRows(model).length) return;
		save(
			configurations.map(configuration => ({
				configuration,
				values: applyRestrictions(
					fromScale(calculateConfiguration(model, configuration.path), nextOrder),
					configuration.cells.map(cell => cell.disabled),
				),
				definition: MANUAL,
			})),
		);
	};

	const startNoisy = () => {
		setPending(null);
		// Noisy-MAX owns every row now; row definitions would go stale on a scale order change
		updateSettings(previous => ({ ...previous, definitions: {} }));
		recalculateNoisyMax(
			startNoisyMax(
				settings.noisyMax,
				noisyParents,
				configurations.map(configuration => ({
					path: configuration.path,
					values: configuration.cells.map(cell => cell.value),
				})),
				outcomeIds,
				order,
			),
		);
	};

	const setFillMode = (mode: 'row' | 'noisy') => {
		if (mode === 'row') {
			setPending(null);
			if (settings.noisyMax)
				updateSettings(previous => ({
					...previous,
					noisyMax: previous.noisyMax && { ...previous.noisyMax, enabled: false },
				}));
			return;
		}
		const filled = configurations.filter(hasValues).length;
		if (filled) setPending({ kind: 'noisy', filled });
		else startNoisy();
	};

	const setLocked = (targets: Configuration[], index: number, locked: boolean) => {
		const outcomeId = childOutcomes[index].id;
		updateSettings(previous => {
			const locks = { ...previous.locks };
			targets.forEach(target => {
				if (target.cells[index].disabled) return;
				const current = new Set(locks[target.key] ?? []);
				if (locked) current.add(outcomeId);
				else current.delete(outcomeId);
				locks[target.key] = [...current];
			});
			return { ...previous, locks };
		});
	};

	const toggleGroup = (groupKey: string) =>
		updateSettings(previous => ({
			...previous,
			collapsed: previous.collapsed.includes(groupKey)
				? previous.collapsed.filter(key => key !== groupKey)
				: [...previous.collapsed, groupKey],
		}));

	const resetAll = () => {
		save(
			configurations.map(configuration => ({
				configuration,
				values: configuration.cells.map(() => 0),
				definition: MANUAL,
			})),
		);
		updateSettings(previous => ({ ...previous, definitions: {}, locks: {} }));
	};

	const randomize = () =>
		save(
			configurations.map(configuration => {
				const enabled = configuration.cells.flatMap((cell, index) =>
					cell.disabled ? [] : [index],
				);
				const random = getRandomProbabilities(enabled.length);
				return {
					configuration,
					values: configuration.cells.map((_, index) =>
						enabled.includes(index) ? random[enabled.indexOf(index)] : 0,
					),
					definition: MANUAL,
				};
			}),
		);

	const selectDefinition = (
		targets: Configuration[],
		type: Definition['type'],
		anchor: HTMLElement | null,
		fillAll = false,
	) => {
		if (type === 'Manual') {
			setManual(targets);
			return;
		}
		if (!anchor) return;
		setPending(null);
		setDefinitionRequest({
			type,
			initial: describeDefinitions(targets).shared,
			anchor,
			outcomes: childOutcomes.map((outcome, index) => ({
				id: outcome.id,
				name: outcome.name,
				disabled: targets.every(target => target.cells[index].disabled),
			})),
			scaleOrder: scaleOrderIds,
			configurationCount: targets.length,
			targets,
			fillAll,
		});
	};

	if (!childOutcomes.length) {
		return (
			<div
				ref={ref}
				className='border-background-medium bg-background-default text-text-tertiary w-87.5 rounded-sm border border-dashed px-3 py-2 text-xs'
			>
				Add at least one outcome to this uncertainty to configure probabilities.
			</div>
		);
	}

	const menuTarget = cellMenu && getSharedCell(cellMenu.targets, cellMenu.index);
	const noisyParameterRows =
		1 + parents.reduce((count, parent) => count + Math.max(parent.states.length - 1, 0), 0);
	const noisyIncomplete =
		!!noisy && getIncompleteRows(buildModel(noisy, noisyParents, outcomeIds, order)).length > 0;

	return (
		<CardContainer
			ref={ref}
			issueType={issue.type}
			selected={!!selected}
			className={cn(
				'w-auto cursor-default rounded-sm border-2 px-4 pt-3 pb-4',
				embedded && 'h-full min-h-0 border-0 p-0 shadow-none!',
			)}
		>
			<div
				className={cn(
					'nodrag nopan nowheel flex min-h-0 flex-col gap-3',
					embedded && 'h-full',
				)}
				onPointerDown={event => event.stopPropagation()}
				onClick={event => event.stopPropagation()}
			>
				<div className='flex items-center justify-between gap-6'>
					<h6 className='text-base leading-6 font-medium'>{`${issue.name} Probability Table`}</h6>
					<div className='flex items-center gap-1'>
						{isDevelopment() && !noisy && (
							<Button
								variant='ghost'
								disabled={!rows.length || isPending}
								onClick={randomize}
							>
								Randomize
							</Button>
						)}
						<Button
							variant='ghost'
							icon
							aria-label='Close probability table'
							onClick={() => onClose?.(false)}
						>
							<Icon data={close} />
						</Button>
					</div>
				</div>
				{parents.length > 0 && (
					<div className='w-fit min-w-60'>
						<SegmentedSelector
							label='Fill table'
							name={`fill-mode-${fieldId}`}
							value={noisy ? 'noisy' : 'row'}
							options={[
								{ value: 'row', label: 'Row by row' },
								{
									value: 'noisy',
									label: 'Noisy-MAX',
									tooltip:
										'Each parent can push the outcome up on its own. Every row is calculated from a few parameters. With two outcomes this is the noisy-OR model.',
								},
							]}
							onChange={event => setFillMode(event.target.value as 'row' | 'noisy')}
						/>
					</div>
				)}
				{pending?.kind === 'noisy' && (
					<ConfirmBanner
						message={`Noisy-MAX calculates every row from a leak row and one row per parent state. ${plural(pending.filled, 'row')} already ${pending.filled === 1 ? 'has' : 'have'} values: parameter rows start from the rows they match, and every row is recalculated once the parameters are complete.`}
						primary={{ label: 'Use Noisy-MAX', onClick: startNoisy }}
						onCancel={() => setPending(null)}
					/>
				)}
				{!noisy && (
					<FillToolbar
						disabled={!rows.length || isPending}
						keepRowsAtOne={settings.keepRowsAtOne}
						onKeepRowsAtOneChange={keepRowsAtOne =>
							updateSettings(previous => ({ ...previous, keepRowsAtOne }))
						}
						onConvertToManual={() => setManual(configurations)}
						onFill={(type, anchor) =>
							selectDefinition(configurations, type, anchor, true)
						}
						onClearAll={resetAll}
					/>
				)}
				{pending?.kind === 'fill' && (
					<ConfirmBanner
						message={`${plural(pending.filled, 'row')} already ${pending.filled === 1 ? 'has' : 'have'} values. Apply ${pending.definition.type} to every row, or only to empty rows?`}
						primary={{
							label: 'Only empty rows',
							onClick: () => {
								fillAll(pending.definition, pending.scaleOrder, true);
								setPending(null);
							},
						}}
						secondary={{
							label: 'Overwrite all',
							onClick: () => {
								fillAll(pending.definition, pending.scaleOrder, false);
								setPending(null);
							},
						}}
						onCancel={() => setPending(null)}
					/>
				)}
				{noisy && (
					<div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2'>
						<div className='w-fit min-w-72'>
							<SegmentedSelector
								label='View'
								compact
								name={`noisy-view-${fieldId}`}
								value={noisy.view}
								options={[
									{
										value: 'parameters',
										label: `Parameters · ${plural(noisyParameterRows, 'row')}`,
									},
									{
										value: 'full',
										label: `Full table · ${plural(configurations.length, 'row')}`,
									},
								]}
								onChange={event =>
									updateSettings(previous => ({
										...previous,
										noisyMax: previous.noisyMax && {
											...previous.noisyMax,
											view: event.target.value as NoisyMaxSettings['view'],
										},
									}))
								}
							/>
						</div>
						{noisy.view === 'parameters' && (
							<KeepRowsAtOneSwitch
								checked={settings.keepRowsAtOne}
								onChange={keepRowsAtOne =>
									updateSettings(previous => ({ ...previous, keepRowsAtOne }))
								}
							/>
						)}
					</div>
				)}
				{noisy?.view === 'parameters' && (
					<NoisyMaxParameters
						issueName={issue.name}
						outcomes={childOutcomes}
						order={order}
						parents={parents}
						settings={noisy}
						keepRowsAtOne={settings.keepRowsAtOne}
						onChange={next => recalculateNoisyMax(next)}
						onOrderChange={ids => recalculateNoisyMax(noisy, ids)}
					/>
				)}
				{noisy?.view === 'full' && noisyIncomplete && (
					<p className='text-xs text-(--eds-text-secondary)'>
						Not calculated yet: every parameter row needs values that sum to 1. The rows
						below keep their earlier values until then.
					</p>
				)}
				{/* Scrolls on its own so the column header and group labels can stay sticky */}
				{noisy?.view !== 'parameters' && (
					<div
						ref={scrollerRef}
						className={cn('min-h-0 overflow-auto', embedded ? 'flex-1' : 'max-h-160')}
					>
						<table className='border-collapse text-left text-sm'>
							<thead ref={measureHeader}>
								<tr>
									{parents.map(parent => (
										<th
											key={parent.issueId}
											className={cn(
												stickyHeader,
												'px-2 py-1 align-bottom font-normal',
											)}
										>
											<div className='flex items-center gap-1.5 whitespace-nowrap'>
												<ParentTypeIndicator kind={parent.kind} />
												<div>
													<div className='text-[10px] leading-[15px] text-(--eds-text-secondary)'>
														{parent.kind === 'decision'
															? 'Decision'
															: 'Uncertainty'}
													</div>
													<div className='leading-5 font-bold'>
														{parent.issueName}
													</div>
												</div>
											</div>
										</th>
									))}
									{childOutcomes.map(outcome => (
										<th
											key={outcome.id}
											className={cn(
												stickyHeader,
												'max-w-24 truncate px-2 py-1 align-bottom leading-5 font-bold',
											)}
											title={outcome.name}
										>
											{outcome.name}
										</th>
									))}
									<th
										className={cn(
											stickyHeader,
											'px-2 py-1 align-bottom leading-5 font-bold',
										)}
									>
										Sum
									</th>
									{!noisy && (
										<th
											className={cn(
												stickyHeader,
												'px-2 py-1 align-bottom leading-5 font-bold',
											)}
										>
											Definition
										</th>
									)}
								</tr>
							</thead>
							<tbody className='border-b border-(--eds-border-non-interactive-neutral-muted)'>
								{displayRows.map((row, rowIndex) => {
									const targets = row.configurations;
									const single = targets.length === 1;
									const definitions = describeDefinitions(targets);
									// Keep rows at 1: show the row as it will be saved while a cell is typed in
									const previews = targets.map(target =>
										live.preview(row.key, target.cells),
									);
									const shownTargets = targets.map((target, i) => ({
										...target,
										cells: target.cells.map((cell, j) => ({
											...cell,
											value: previews[i].values[j],
										})),
									}));
									const sumTargets = targets.map((target, i) => ({
										...target,
										cells: previews[i].sumCells,
									}));
									const pad = cn(
										'px-1 py-1',
										rowIndex === 0 && 'pt-2',
										rowIndex === displayRows.length - 1 && 'pb-2',
										row.divider && `${divider} pt-2`,
										displayRows[rowIndex + 1]?.divider && 'pb-2',
									);
									return (
										<tr key={row.key}>
											{row.parentCells.map(cell => (
												<td
													key={cell.column}
													rowSpan={cell.rowSpan}
													className={cn(
														'group h-px px-1 py-1 align-middle whitespace-nowrap',
														rowIndex === 0 && 'pt-2',
														row.divider && `${divider} pt-2`,
														displayRows[rowIndex + cell.rowSpan]
															?.divider !== false && 'pb-2',
													)}
												>
													{cell.groupKey ? (
														<button
															type='button'
															aria-expanded={!cell.collapsed}
															aria-label={`${cell.collapsed ? 'Expand' : 'Collapse'} ${cell.label}`}
															data-group-label
															className='flex h-full min-h-9 w-full min-w-26 cursor-pointer flex-col justify-center rounded-sm px-2 text-left hover:bg-(--eds-background-interactive-neutral-muted-hover) focus-visible:outline-2 focus-visible:outline-(--eds-color-border-focus) active:bg-(--eds-background-interactive-neutral-muted-pressed) data-[pin=top]:justify-start'
															onClick={() =>
																toggleGroup(cell.groupKey!)
															}
														>
															{/* Sticks below the header until the group's own cell scrolls out */}
															<span className='sticky top-(--pt-header) flex h-9 w-full items-center justify-between gap-3'>
																{cell.label}
																<Icon
																	data={
																		cell.collapsed
																			? chevron_right
																			: chevron_down
																	}
																	size='sm'
																	className={cn(
																		'shrink-0 text-(--eds-icon-interactive-accent-default)',
																		!cell.collapsed &&
																			'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
																	)}
																/>
															</span>
														</button>
													) : (
														<div className='flex h-9 min-w-26 items-center px-2'>
															{cell.label}
														</div>
													)}
												</td>
											))}
											{row.summaryColSpan > 0 && (
												<td colSpan={row.summaryColSpan} className={pad}>
													<div className='flex h-9 items-center px-2 whitespace-nowrap'>
														{targets.length} configurations
													</div>
												</td>
											)}
											{childOutcomes.map((outcome, index) => {
												const shared = getSharedCell(shownTargets, index);
												const readOnly = !!noisy || shared.readOnly;
												return (
													<td key={outcome.id} className={pad}>
														<ProbabilityInput
															value={shared.value}
															label={`${outcome.name}${single ? '' : `, ${targets.length} configurations`}`}
															disabled={shared.disabled}
															readOnly={readOnly}
															locked={!noisy && shared.locked}
															machineFilled={readOnly}
															adjusted={previews.some(preview =>
																preview.adjusted.has(index),
															)}
															readOnlyReason={
																noisy
																	? 'Calculated by Noisy-MAX. Change the parameters to change this row.'
																	: shared.readOnly
																		? `Calculated by ${definitions.label}. Double-click to edit as manual values.`
																		: shared.locked
																			? 'Locked. Right-click to unlock.'
																			: undefined
															}
															onDraftChange={value =>
																live.draft(row.key, index, value)
															}
															onCommit={value =>
																setCell(
																	row.key,
																	targets,
																	index,
																	value,
																)
															}
															onDoubleClick={
																noisy
																	? undefined
																	: () => setManual(targets)
															}
															onContextMenu={event => {
																if (shared.disabled) return;
																event.preventDefault();
																setCellMenu({
																	x: event.clientX,
																	y: event.clientY,
																	targets,
																	index,
																	anchor: event.currentTarget,
																});
															}}
														/>
													</td>
												);
											})}
											<td className={cn(pad, 'text-center')}>
												<SumCell
													sum={rowSum(sumTargets[0].cells)}
													invalidCount={
														sumTargets.filter(
															target => !isRowValid(target.cells),
														).length
													}
													configurationCount={targets.length}
													outcomes={childOutcomes.map(
														(outcome, index) => ({
															name: outcome.name,
															available: targets.some(
																target =>
																	!target.cells[index].locked &&
																	!target.cells[index].disabled,
															),
														}),
													)}
													onFix={fix => applyFix(targets, fix)}
												/>
											</td>
											{!noisy && (
												<td className={pad}>
													<DefinitionButton
														label={definitions.label}
														detail={definitions.detail}
														emphasised={
															!!definitions.shared &&
															definitions.shared.type !== 'Manual'
														}
														onSelect={(type, anchor) =>
															selectDefinition(targets, type, anchor)
														}
													/>
												</td>
											)}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
			{cellMenu && menuTarget && (
				<TableMenu
					store={cellMenuStore}
					getAnchorRect={() => ({ x: cellMenu.x, y: cellMenu.y })}
				>
					{noisy ? (
						<TableMenuItem onClick={() => setFillMode('row')}>
							Switch table to Row by row
						</TableMenuItem>
					) : menuTarget.readOnly ? (
						[
							<TableMenuItem key='manual' onClick={() => setManual(cellMenu.targets)}>
								Set as manual
							</TableMenuItem>,
							<TableMenuItem
								key='change'
								onClick={() =>
									selectDefinition(
										cellMenu.targets,
										describeDefinitions(cellMenu.targets).shared?.type ??
											'Normal',
										cellMenu.anchor,
									)
								}
							>
								Change definition…
							</TableMenuItem>,
							<TableMenuItem key='clear' onClick={() => clearRows(cellMenu.targets)}>
								Clear values
							</TableMenuItem>,
						]
					) : (
						[
							<TableMenuItem
								key='lock'
								onClick={() =>
									setLocked(cellMenu.targets, cellMenu.index, !menuTarget.locked)
								}
							>
								{menuTarget.locked ? 'Unlock cell' : 'Lock cell'}
							</TableMenuItem>,
							<TableMenuItem
								key='clear'
								onClick={() =>
									setCell('', cellMenu.targets, cellMenu.index, 0, true)
								}
							>
								Clear cell
							</TableMenuItem>,
						]
					)}
				</TableMenu>
			)}
			{definitionRequest && (
				<DefinitionEditor
					key={`${definitionRequest.type}-${definitionRequest.targets.map(t => t.key).join()}`}
					request={definitionRequest}
					onApply={(definition, nextOrderIds) =>
						onDefinitionApply(definitionRequest, definition, nextOrderIds)
					}
					onClose={() => setDefinitionRequest(null)}
				/>
			)}
		</CardContainer>
	);
};

type ProbabilityTableProps = {
	ref?: React.Ref<HTMLDivElement>;
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
	/** Inside another surface such as the side sheet: no card border, shadow or padding */
	embedded?: boolean;
};
