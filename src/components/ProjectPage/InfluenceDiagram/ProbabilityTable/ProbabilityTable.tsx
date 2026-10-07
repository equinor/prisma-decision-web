import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { useBulkUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { isDevelopment } from '../../../../utils/getEnvironment';
import { getRestrictedOutcomeIds } from '../../../../utils/getProbabilityRestrictions';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { DiscreteValueTable } from '../DiscreteValueTable/DiscreteValueTable';
import { DiscreteProbabilityCell } from './DiscreteProbabilityCell';
import { useProbablityTable } from './useProbablityTable';
import { calculateRowSum, isRowSumValid } from './utils';

const getRandomProbabilities = (count: number): number[] => {
	const cutPoints = Array.from({ length: Math.max(0, count - 1) }, () =>
		Math.floor(Math.random() * 101),
	).sort((first, second) => first - second);
	const boundaries = [0, ...cutPoints, 100];

	return boundaries.slice(1).map((boundary, index) => (boundary - boundaries[index]) / 100);
};

export const ProbabilityTable = ({ issue, selected, onClose, ref }: ProbabilityTableProps) => {
	const { childOutcomes, parents, parentRowSpans, rows, lookups, restrictedEntries } =
		useProbablityTable(issue);
	const { mutate: updateProbabilities, isPending } = useBulkUpdateDiscreteProbabilities();
	const probabilities = rows.flatMap(row => row.values);
	const hasNonZeroValue = probabilities.some(probability => probability.probability !== 0);
	const randomizeProbabilities = () => {
		const randomizedProbabilities = rows.flatMap(row => {
			const restrictedOutcomeIds = getRestrictedOutcomeIds(
				row.values[0],
				childOutcomes.map(outcome => outcome.id),
				restrictedEntries,
			);
			const availableProbabilities = row.values.filter(
				probability => !restrictedOutcomeIds.has(probability.outcome_id),
			);
			const randomValues = getRandomProbabilities(availableProbabilities.length);
			const randomValueById = new Map(
				availableProbabilities.map((probability, index) => [
					probability.id,
					randomValues[index],
				]),
			);

			return row.values.map(probability => ({
				...probability,
				probability: randomValueById.get(probability.id) ?? 0,
			}));
		});

		updateProbabilities(randomizedProbabilities);
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
	return (
		<CardContainer
			ref={ref}
			issueType={issue.type}
			selected={!!selected}
			className='w-auto rounded-sm border-2 px-2 pt-1 pb-2'
		>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between pt-1 pb-2 pl-2'>
					<h6 className='leading-6 font-medium'>{`${issue.name} Probability Table`}</h6>
					<div className='flex items-center gap-1'>
						{isDevelopment() && (
							<Button
								variant='outlined'
								disabled={!rows.length || isPending}
								onClick={randomizeProbabilities}
							>
								Randomize
							</Button>
						)}
						<Button
							variant='outlined'
							disabled={!hasNonZeroValue || isPending}
							onClick={() =>
								updateProbabilities(
									probabilities.map(probability => ({
										...probability,
										probability: 0,
									})),
								)
							}
						>
							Reset all
						</Button>
						<Button variant='ghost_icon' onClick={() => onClose?.(false)}>
							<Icon data={close} />
						</Button>
					</div>
				</div>
				<DiscreteValueTable
					parents={parents}
					parentRowSpans={parentRowSpans}
					rows={rows}
					lookups={lookups}
					valueColumns={[
						...childOutcomes.map(outcome => ({
							id: outcome.id,
							label: outcome.name,
							eyebrow: issue.name,
						})),
						{ id: 'sum', label: 'Sum' },
					]}
					renderValueCells={probabilities => {
						const sum = calculateRowSum(probabilities);
						const disabledOutcomeIds = getRestrictedOutcomeIds(
							probabilities[0],
							childOutcomes.map(outcome => outcome.id),
							restrictedEntries,
						);
						const isValid =
							disabledOutcomeIds.size === childOutcomes.length || isRowSumValid(sum);

						return (
							<>
								{childOutcomes.map(outcome => (
									<DiscreteProbabilityCell
										key={
											outcome.id +
											probabilities.find(p => p.outcome_id === outcome.id)
												?.probability
										}
										outcomeId={outcome.id}
										probabilities={probabilities}
										disabledReason={
											disabledOutcomeIds.has(outcome.id)
												? 'Disabled by a restriction on a parent edge.'
												: undefined
										}
									/>
								))}
								<td
									className={`bg-background-default rounded-sm px-2 py-1 text-center text-sm ${
										isValid ? 'text-text-tertiary' : 'text-red-600'
									}`}
								>
									{isValid ? '∑=1' : '∑≠1'}
								</td>
							</>
						);
					}}
				/>
			</div>
		</CardContainer>
	);
};

type ProbabilityTableProps = {
	ref?: React.Ref<HTMLDivElement>;
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
