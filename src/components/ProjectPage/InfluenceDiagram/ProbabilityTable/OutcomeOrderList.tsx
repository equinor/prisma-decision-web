import { Button, Icon } from '@equinor/eds-core-react/next';
import { arrow_down, arrow_up, drag_handle } from '@equinor/eds-icons';
import { useState } from 'react';
import { cn } from '../../../../utils/cn';
import { formatProbability } from './probabilityFormat';

type Outcome = { id: string; name: string; disabled?: boolean };

/**
 * Outcomes from low to high on the scale used by definitions and Noisy-MAX. Drag a row, or use
 * the up/down buttons from the keyboard. Optional bars show each outcome's probability.
 */
export const OutcomeOrderList = ({
	outcomes,
	values,
	onChange,
}: {
	/** In scale order */
	outcomes: Outcome[];
	/** In scale order */
	values?: number[];
	onChange: (ids: string[]) => void;
}) => {
	const [dragging, setDragging] = useState<number | null>(null);
	// While dragging, the order is local; it is committed once on drop
	const [dragOrder, setDragOrder] = useState<string[] | null>(null);
	const ids = outcomes.map(outcome => outcome.id);
	const shownIds = dragOrder ?? ids;
	const shown = shownIds.map(id => outcomes.find(outcome => outcome.id === id)!);
	const shownValues = values && shownIds.map(id => values[ids.indexOf(id)]);
	const largest = Math.max(...(values ?? [0]), 0.0001);
	const reorder = (list: string[], from: number, to: number) => {
		const next = [...list];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		return next;
	};
	const move = (from: number, to: number) => {
		if (to < 0 || to >= ids.length || from === to) return;
		onChange(reorder(ids, from, to));
	};
	const endDrag = () => {
		if (dragOrder && dragOrder.join() !== ids.join()) onChange(dragOrder);
		setDragging(null);
		setDragOrder(null);
	};

	return (
		<ol className='flex flex-col' aria-label='Outcome scale order, low to high'>
			{shown.map((outcome, index) => (
				<li
					key={outcome.id}
					draggable
					onDragStart={event => {
						setDragging(index);
						setDragOrder(ids);
						event.dataTransfer.effectAllowed = 'move';
					}}
					onDragOver={event => {
						if (dragging === null || !dragOrder) return;
						event.preventDefault();
						if (dragging !== index) {
							setDragOrder(reorder(dragOrder, dragging, index));
							setDragging(index);
						}
					}}
					onDrop={event => event.preventDefault()}
					onDragEnd={endDrag}
					className={cn(
						'flex h-8 items-center gap-2 rounded-sm text-xs',
						dragging === index &&
							'bg-(--eds-background-interactive-neutral-muted-hover)',
					)}
				>
					<Icon
						data={drag_handle}
						size='sm'
						className='shrink-0 cursor-grab text-(--eds-text-secondary)'
					/>
					<span className='w-3 text-right text-(--eds-text-secondary) tabular-nums'>
						{index + 1}
					</span>
					<span className='w-20 truncate' title={outcome.name}>
						{outcome.name}
					</span>
					{shownValues && (
						<>
							<span className='h-2 flex-1 rounded-full bg-(--eds-dataviz-cat-1-1)'>
								<span
									className='block h-2 rounded-full bg-(--eds-dataviz-cat-1-3)'
									style={{ width: `${(shownValues[index] / largest) * 100}%` }}
								/>
							</span>
							<span className='w-10 text-right tabular-nums'>
								{outcome.disabled ? '–' : formatProbability(shownValues[index])}
							</span>
						</>
					)}
					<span className={cn('flex', !values && 'ml-auto')}>
						<Button
							variant='ghost'
							size='small'
							icon
							aria-label={`Move ${outcome.name} up`}
							disabled={index === 0}
							onClick={() => move(index, index - 1)}
						>
							<Icon data={arrow_up} size='sm' />
						</Button>
						<Button
							variant='ghost'
							size='small'
							icon
							aria-label={`Move ${outcome.name} down`}
							disabled={index === outcomes.length - 1}
							onClick={() => move(index, index + 1)}
						>
							<Icon data={arrow_down} size='sm' />
						</Button>
					</span>
				</li>
			))}
		</ol>
	);
};
