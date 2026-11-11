import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { useUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { ConditionalTable } from '../ConditionalTable/ConditionalTable';
import { RandomizeProbabilitiesButton } from './RandomizeProbabilitiesButton';
import { ResetProbabilitiesButton } from './ResetProbabilitiesButton';
import { useProbablityTable } from './useProbablityTable';
import { calculateRowSum, isRowSumValid } from './utils';

export const ProbabilityTable = ({ issue, selected, onClose }: ProbabilityTableProps) => (
	<CardContainer
		issueType={issue.type}
		selected={selected}
		className='w-auto rounded-sm border-2 px-2 pt-1 pb-2'
	>
		<div className='flex flex-col'>
			<div className='flex items-center gap-1 pt-1 pb-2 pl-2'>
				<h6 className='mr-auto pr-2 leading-6 font-medium'>{`${issue.name} Probability Table`}</h6>
				<RandomizeProbabilitiesButton issue={issue} />
				<ResetProbabilitiesButton issue={issue} />
				<Button variant='ghost_icon' onClick={() => onClose(false)}>
					<Icon data={close} />
				</Button>
			</div>
			<ProbabilityConditionalTable issue={issue} />
		</div>
	</CardContainer>
);

export const ProbabilityConditionalTable = ({ issue }: { issue: Issue }) => {
	const { childOutcomes, parents, rows, lookups, restrictedCells } = useProbablityTable(issue);
	const { mutate: updateProbability } = useUpdateDiscreteProbabilities();
	if (!childOutcomes.length) {
		return (
			<p className='text-text-tertiary px-2 py-1 text-xs'>
				Add at least one outcome to this uncertainty to configure probabilities.
			</p>
		);
	}
	return (
		<ConditionalTable
			parents={parents}
			rows={rows}
			lookups={lookups}
			restrictedCells={restrictedCells}
		>
			<ConditionalTable.Head>
				{childOutcomes.map(outcome => (
					<ConditionalTable.Column key={outcome.id} eyebrow={issue.name}>
						{outcome.name}
					</ConditionalTable.Column>
				))}
				<ConditionalTable.Column>Sum</ConditionalTable.Column>
			</ConditionalTable.Head>
			<ConditionalTable.Body>
				{rows.map(row => {
					const isValid =
						row.values.filter(probability => restrictedCells.includes(probability.id))
							.length === childOutcomes.length ||
						isRowSumValid(calculateRowSum(row.values));
					return (
						<ConditionalTable.Row key={row.rowKey}>
							{childOutcomes.map(outcome => {
								const probability = row.values.find(
									probability => probability.outcome_id === outcome.id,
								);
								return (
									probability && (
										<ConditionalTable.NumberCell
											key={outcome.id + probability.probability}
											id={probability.id}
											value={probability.probability}
											min={0}
											max={1}
											onCommit={value =>
												updateProbability({
													...probability,
													probability: value,
												})
											}
										/>
									)
								);
							})}
							<ConditionalTable.ValueCell
								className={isValid ? 'text-text-tertiary' : 'text-red-600'}
							>
								{isValid ? '∑=1' : '∑≠1'}
							</ConditionalTable.ValueCell>
						</ConditionalTable.Row>
					);
				})}
			</ConditionalTable.Body>
		</ConditionalTable>
	);
};

type ProbabilityTableProps = {
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
