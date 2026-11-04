import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DragDropProvider } from '@dnd-kit/react';
import { useUpdateStakeholderMatrix } from '../../../hooks/api/useUpdateStakeholderMatrix';
import { useSelectedProjectStakeholders } from '../../../hooks/useSelectedProjectStakeholders';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { StakeholderCard } from './StakeholderCard';
import { clampAxisValue, stakeholderRegions } from './stakeholderRegions';

const quadrantOrder = ['consult', 'partnerClosely', 'observe', 'keepInformed'] as const;
const gridModifiers = [
	RestrictToElement.configure({
		element: operation => operation.source?.element?.parentElement ?? null,
	}),
];

export const StakeholderGrid = () => {
	const { data: stakeholders, isLoading } = useSelectedProjectStakeholders();
	const { mutate: updateStakeholder } = useUpdateStakeholderMatrix();

	const sorted = [...stakeholders].sort(
		(a, b) =>
			a.affecting_the_decision +
			a.affected_by_the_decision -
			(b.affecting_the_decision + b.affected_by_the_decision),
	);

	return (
		<DragDropProvider
			modifiers={gridModifiers}
			onDragEnd={({ canceled, operation: { source, transform, shape } }) => {
				if (canceled || !source || !shape || (!transform.x && !transform.y)) return;
				const stakeholder = stakeholders.find(
					current => current.stakeholder_matrix_id === source.id,
				);
				const plot = source.element?.parentElement;
				if (!stakeholder || !plot) return;
				const rangeX = Math.max(
					0,
					plot.clientWidth - shape.initial.boundingRectangle.width,
				);
				const rangeY = Math.max(
					0,
					plot.clientHeight - shape.initial.boundingRectangle.height,
				);
				updateStakeholder({
					...stakeholder,
					affecting_the_decision: rangeX
						? clampAxisValue(stakeholder.affecting_the_decision + transform.x / rangeX)
						: stakeholder.affecting_the_decision,
					affected_by_the_decision: rangeY
						? clampAxisValue(
								stakeholder.affected_by_the_decision - transform.y / rangeY,
							)
						: stakeholder.affected_by_the_decision,
				});
			}}
		>
			<div className='relative flex min-h-0 flex-1 gap-2'>
				{isLoading && <LoadingSpinner />}
				<div className='dark:text-text-tertiary flex w-[50px] shrink-0 flex-col items-center justify-between pb-[23px] text-xs leading-4 font-medium whitespace-nowrap text-(--eds-color-text-subtle)'>
					<span>High (1) ↑</span>
					<span className='dark:text-text-default h-[210px] w-[18px] text-sm leading-4 text-(--eds-color-text-strong) [writing-mode:vertical-rl]'>
						Affected by the decision
					</span>
					<span>Low (0)</span>
				</div>
				<div className='flex min-w-0 flex-1 flex-col gap-2'>
					<div
						className='dark:border-background-medium relative min-h-0 flex-1 border border-(--eds-color-border-medium)'
						aria-label={`Stakeholder matrix with ${stakeholders.length} stakeholders`}
					>
						<div className='grid h-full w-full grid-cols-2 grid-rows-2'>
							{quadrantOrder.map(key => (
								<div
									key={key}
									className={`dark:border-background-medium border-[rgba(111,111,111,0.7)] p-3 text-[10px] leading-4 font-medium tracking-[1.1px] uppercase ${stakeholderRegions[key].quadrantClassName}`}
								>
									{stakeholderRegions[key].label}
								</div>
							))}
						</div>
						{sorted.map((stakeholder, index) => (
							<StakeholderCard
								key={stakeholder.stakeholder_matrix_id}
								stakeholder={stakeholder}
								zIndex={index + 1}
								frontZIndex={sorted.length + 1}
							/>
						))}
					</div>
					<div className='dark:text-text-tertiary flex items-start justify-between text-xs leading-4 font-medium whitespace-nowrap text-(--eds-color-text-subtle)'>
						<span>Low (0)</span>
						<span className='dark:text-text-default text-sm leading-4 text-(--eds-color-text-strong)'>
							Affecting the decision
						</span>
						<span>High (1) →</span>
					</div>
				</div>
			</div>
		</DragDropProvider>
	);
};
