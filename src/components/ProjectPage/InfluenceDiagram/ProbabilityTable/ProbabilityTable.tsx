import { Button, Icon } from '@equinor/eds-core-react';
import { getDiagramIssueBorderColor } from '../../../../utils/getDiagramIssueBorderColor';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { DiscreteProbabilityCell } from './DiscreteProbabilityCell';
import { useProbablityTable } from './useProbablityTable';
import { getParentLabel } from './utils';
import { close } from '@equinor/eds-icons';

export const ProbabilityTable = ({ issue, selected, onClose }: ProbabilityTableProps) => {
	const { childOutcomes, parents, parentRowSpans, rows, lookups } = useProbablityTable(issue);

	if (!childOutcomes.length) {
		return (
			<div className='border-background-medium bg-background-default text-text-tertiary absolute mt-2 max-w-[350px] rounded-sm border border-dashed px-3 py-2 text-xs'>
				Add at least one outcome to this uncertainty to configure probabilities.
			</div>
		);
	}
	return (
		<CardContainer
			className={`absolute top-0 left-[calc(100%+8px)] w-auto rounded-sm border-2 ${getDiagramIssueBorderColor(issue.type, !!selected)}`}
		>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center justify-between'>
					<h6 className='leading-6 font-medium'>{`${issue.name} Probability table`}</h6>
					<Button variant='ghost_icon' onClick={() => onClose?.(false)}>
						<Icon data={close} />
					</Button>
				</div>
				<table className='w-full border-collapse'>
					<thead>
						<tr className='text-text-tertiary text-left text-[0.7rem] uppercase'>
							{parents.map(parent => (
								<th
									key={parent.issueId}
									className='border-background-medium border-b-2 px-2 py-1 font-semibold whitespace-nowrap'
								>
									{parent.issueName}
								</th>
							))}
							{childOutcomes.map(outcome => (
								<th
									key={outcome.id}
									className='border-background-medium border-b-2 px-2 py-1 font-semibold'
								>
									{outcome.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map(({ rowKey, probabilities }, rowIndex) => (
							<tr
								key={rowKey}
								className='border-background-medium border-b-2 text-sm last:border-b-0'
							>
								{/* Render parent state labels with row spanning */}
								{parents.map((parent, parentIndex) => {
									const rowSpan = parentRowSpans[parentIndex];
									const shouldRenderCell = rowIndex % rowSpan === 0;
									if (!shouldRenderCell) return null;

									const label = getParentLabel(probabilities[0], parent, lookups);
									return (
										<td
											key={`${rowKey}-${parent.issueId}`}
											rowSpan={rowSpan}
											className='text-text-secondary px-2 py-1'
										>
											{label}
										</td>
									);
								})}
								{/* Render probability inputs for each outcome */}
								{childOutcomes.map(outcome => (
									<DiscreteProbabilityCell
										key={outcome.id}
										outcomeId={outcome.id}
										probabilities={probabilities}
									/>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</CardContainer>
	);
};

type ProbabilityTableProps = {
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
