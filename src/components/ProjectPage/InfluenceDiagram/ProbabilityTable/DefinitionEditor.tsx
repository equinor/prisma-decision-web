import { Popover, PopoverHeading, usePopoverStore } from '@ariakit/react';
import { Button, Icon, TextField } from '@equinor/eds-core-react/next';
import { close } from '@equinor/eds-icons';
import { useEffect, useState } from 'react';
import { NormalCurve, SliderField } from './NormalCurve';
import { OutcomeOrderList } from './OutcomeOrderList';
import {
	Definition,
	defaultDefinition,
	getDefinitionProbabilities,
	NonManualDefinition,
	toScale,
} from './probabilityTableMath';
import { formatProbability } from './probabilityFormat';
import { cn } from '../../../../utils/cn';

type NonManualType = NonManualDefinition['type'];

const fields: Record<NonManualType, { key: string; label: string; help?: string }[]> = {
	Normal: [
		{ key: 'centre', label: 'Centre' },
		{ key: 'sd', label: 'Standard deviation' },
	],
	Uniform: [
		{ key: 'min', label: 'Min' },
		{ key: 'max', label: 'Max' },
	],
	Triangular: [
		{ key: 'min', label: 'Min' },
		{ key: 'mode', label: 'Most likely' },
		{ key: 'max', label: 'Max' },
	],
	Expression: [{ key: 'expression', label: 'Weight f(x)' }],
};

const titles: Record<NonManualType, string> = {
	Normal: 'Normal distribution',
	Uniform: 'Uniform distribution',
	Triangular: 'Triangular distribution',
	Expression: 'Expression',
};

const toDraft = (definition: Definition): Record<string, string> =>
	Object.fromEntries(
		Object.entries(definition)
			.filter(([key]) => key !== 'type')
			.map(([key, value]) => [key, String(value)]),
	);

const fromDraft = (type: NonManualType, draft: Record<string, string>): NonManualDefinition => {
	if (type === 'Expression') return { type, expression: draft.expression ?? '' };
	const number = (key: string) =>
		draft[key]?.trim() ? Number(draft[key].replace(',', '.')) : NaN;
	if (type === 'Normal') return { type, centre: number('centre'), sd: number('sd') };
	if (type === 'Uniform') return { type, min: number('min'), max: number('max') };
	return { type, min: number('min'), mode: number('mode'), max: number('max') };
};

export type DefinitionRequest = {
	type: NonManualType;
	initial?: Definition;
	anchor: HTMLElement;
	/** In column order */
	outcomes: { id: string; name: string; disabled: boolean }[];
	/** Outcome ids low → high */
	scaleOrder: string[];
	configurationCount: number;
};

export const DefinitionEditor = ({
	request,
	onApply,
	onClose,
}: {
	request: DefinitionRequest;
	/** The scale order is returned too: the Normal editor lets the user reorder outcomes */
	onApply: (definition: NonManualDefinition, scaleOrder: string[]) => void;
	onClose: () => void;
}) => {
	const { type, initial, anchor, outcomes, configurationCount } = request;
	const [draft, setDraft] = useState(() =>
		toDraft(initial?.type === type ? initial : defaultDefinition(type, outcomes.length)),
	);
	const [scaleOrder, setScaleOrder] = useState(request.scaleOrder);
	const order = scaleOrder.map(id => outcomes.findIndex(outcome => outcome.id === id));
	const popover = usePopoverStore({
		open: true,
		setOpen: open => !open && onClose(),
		placement: 'bottom-end',
	});
	useEffect(() => popover.setAnchorElement(anchor), [anchor, popover]);

	const definition = fromDraft(type, draft);
	const result = getDefinitionProbabilities(
		definition,
		outcomes.map(outcome => outcome.disabled),
		order,
	);
	const values = 'values' in result ? result.values : undefined;
	const largest = Math.max(...(values ?? [0]), 0.0001);
	const scaleOutcomes = toScale(outcomes, order);
	const scaleValues = values && toScale(values, order);
	const setField = (key: string, value: string) =>
		setDraft(previous => ({ ...previous, [key]: value }));

	return (
		<Popover
			store={popover}
			portal
			gutter={4}
			className={cn(
				'nodrag nopan nowheel z-[1100] flex max-h-[90vh] flex-col gap-4 overflow-y-auto rounded-sm border border-(--eds-color-border-subtle) bg-(--eds-color-bg-floating) p-4 shadow-md outline-none',
				type === 'Normal' ? 'w-96' : 'w-80',
			)}
			onClick={event => event.stopPropagation()}
			onPointerDown={event => event.stopPropagation()}
			onKeyDown={event => event.stopPropagation()}
		>
			<div className='flex items-start justify-between gap-2'>
				<div>
					<PopoverHeading className='text-base font-medium'>
						{titles[type]}
					</PopoverHeading>
					<p className='text-xs text-(--eds-text-secondary)'>
						{type === 'Normal'
							? 'Centre and spread are relative to the outcome scale: 0 to 1, one equal slice per outcome.'
							: `Outcomes are positions 1–${outcomes.length} on the outcome scale.`}
						{configurationCount > 1 &&
							` Applies to ${configurationCount} configurations.`}
					</p>
				</div>
				<Button variant='ghost' size='small' icon aria-label='Close' onClick={onClose}>
					<Icon data={close} size='sm' />
				</Button>
			</div>
			<form
				className='flex flex-col gap-4'
				onSubmit={event => {
					event.preventDefault();
					if (values) onApply(definition, scaleOrder);
				}}
			>
				{type === 'Normal' && (
					<>
						<NormalCurve
							centre={definition.type === 'Normal' ? definition.centre : NaN}
							sd={definition.type === 'Normal' ? definition.sd : NaN}
							names={scaleOutcomes.map(outcome => outcome.name)}
							values={scaleValues}
							onCentreChange={centre => setField('centre', String(centre))}
						/>
						<SliderField
							label='Centre'
							value={draft.centre ?? ''}
							min={0}
							max={1}
							onChange={value => setField('centre', value)}
						/>
						<SliderField
							label='Standard deviation'
							value={draft.sd ?? ''}
							min={0.01}
							max={1}
							onChange={value => setField('sd', value)}
						/>
						{!values && (
							<p className='text-sm text-(--eds-text-on-muted-danger)'>
								{'error' in result && result.error}
							</p>
						)}
						<div className='flex flex-col gap-1'>
							<span className='text-xs text-(--eds-text-secondary)'>
								Outcome scale order
							</span>
							<OutcomeOrderList
								outcomes={scaleOutcomes}
								values={scaleValues}
								onChange={setScaleOrder}
							/>
						</div>
					</>
				)}
				{type !== 'Normal' && (
					<>
						<div className='grid grid-cols-2 gap-3'>
							{fields[type].map((field, index) => (
								<TextField
									key={field.key}
									label={field.label}
									autoFocus={index === 0}
									inputMode={type === 'Expression' ? 'text' : 'decimal'}
									placeholder={type === 'Expression' ? 'e.g. exp(-x)' : undefined}
									className={type === 'Expression' ? 'col-span-2' : undefined}
									value={draft[field.key] ?? ''}
									invalid={!values}
									hideErrorIcon
									onChange={event => setField(field.key, event.target.value)}
								/>
							))}
						</div>
						{type === 'Expression' && (
							<p className='-mt-2 text-xs text-(--eds-text-secondary)'>
								Use x (outcome 1–{outcomes.length}) and n. Weights are scaled to sum
								to 1. Functions: exp, ln, log, sqrt, abs, min, max, pow.
							</p>
						)}
						<div aria-live='polite'>
							{scaleValues ? (
								<ul className='flex flex-col gap-1' aria-label='Preview'>
									{scaleOutcomes.map((outcome, index) => (
										<li
											key={outcome.id}
											className='flex items-center gap-2 text-xs'
										>
											<span className='w-20 truncate' title={outcome.name}>
												{outcome.name}
											</span>
											<span className='h-2 flex-1 rounded-full bg-(--eds-dataviz-cat-1-1)'>
												<span
													className='block h-2 rounded-full bg-(--eds-dataviz-cat-1-3)'
													style={{
														width: `${(scaleValues[index] / largest) * 100}%`,
													}}
												/>
											</span>
											<span className='w-10 text-right tabular-nums'>
												{outcome.disabled
													? '–'
													: formatProbability(scaleValues[index])}
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className='text-sm text-(--eds-text-on-muted-danger)'>
									{'error' in result && result.error}
								</p>
							)}
						</div>
					</>
				)}
				<div className='flex justify-end gap-2'>
					<Button type='button' variant='ghost' size='small' onClick={onClose}>
						Cancel
					</Button>
					<Button type='submit' size='small' disabled={!values}>
						Apply
					</Button>
				</div>
			</form>
		</Popover>
	);
};
