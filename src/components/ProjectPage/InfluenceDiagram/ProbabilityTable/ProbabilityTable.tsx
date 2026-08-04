import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { cn } from '../../../../utils/cn';
import { getDiagramIssueBorderColor } from '../../../../utils/getDiagramIssueBorderColor';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { ParentTypeIndicator } from '../../../common/ParentTypeIndicator';
import { DiscreteProbabilityCell } from './DiscreteProbabilityCell';
import { useProbablityTable } from './useProbablityTable';
import { calculateRowSum, getParentLabel, isRowSumValid } from './utils';

export const ProbabilityTable = ({ issue, selected, onClose, ref }: ProbabilityTableProps) => {
	const { childOutcomes, parents, parentRowSpans, rows, lookups } = useProbablityTable(issue);

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
			className={`w-auto rounded-sm border-2 px-2 pt-1 pb-2 ${getDiagramIssueBorderColor(issue.type, !!selected)}`}
		>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between pt-1 pb-2 pl-2'>
					<h6 className='leading-6 font-medium'>{`${issue.name} Probability Table`}</h6>
					<Button variant='ghost_icon' onClick={() => onClose?.(false)}>
						<Icon data={close} />
					</Button>
				</div>
				<div
					className={cn('grid grid-cols-[auto_auto] gap-2', {
						'grid-cols-[auto]': parents.length === 0,
					})}
				>
					{/* Parent issues table */}
					{parents.length > 0 && (
						<table className='bg-background-light border-separate border-spacing-2 rounded-sm'>
							<thead>
								<tr className='text-left text-[0.7rem]'>
									{parents.map(parent => (
										<th
											key={parent.issueId}
											className='bg-background-default rounded-sm px-2 py-1 font-normal whitespace-nowrap'
										>
											<div className='flex items-center gap-1.5'>
												<ParentTypeIndicator kind={parent.kind} />
												<div>
													<span className='text-text-tertiary text-[10px]'>
														{parent.kind === 'decision'
															? 'Decision'
															: 'Uncertainty'}
													</span>
													<div className='text-sm font-bold'>
														{parent.issueName}
													</div>
												</div>
											</div>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{rows.map(({ rowKey, probabilities }, rowIndex) => (
									<tr key={rowKey}>
										{parents.map((parent, parentIndex) => {
											const rowSpan = parentRowSpans[parentIndex];
											const shouldRenderCell = rowIndex % rowSpan === 0;
											if (!shouldRenderCell) return null;

											const label = getParentLabel(
												probabilities[0],
												parent,
												lookups,
											);
											return (
												<td
													key={`${rowKey}-${parent.issueId}`}
													rowSpan={rowSpan}
													className='bg-background-default rounded-sm px-2 py-1 text-sm whitespace-nowrap'
												>
													{label}
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					)}

					{/* Child outcomes table */}
					<table className='bg-background-light border-separate border-spacing-2 rounded-sm'>
						<thead>
							<tr className='text-left text-[0.7rem]'>
								{childOutcomes.map(outcome => (
									<th
										key={outcome.id}
										className='bg-background-default rounded-sm px-2 py-1 font-normal'
									>
										<div className='text-text-tertiary text-[10px]'>
											{issue.name}
										</div>
										<div className='max-w-20 truncate text-sm font-bold'>
											{outcome.name}
										</div>
									</th>
								))}
								<th className='bg-background-default rounded-sm px-2 py-1 text-center'>
									<div className='text-text-primary  text-sm font-medium'>
										Sum
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map(({ rowKey, probabilities }) => {
								const sum = calculateRowSum(probabilities);
								const isValid = isRowSumValid(sum);
								return (
									<tr key={rowKey}>
										{childOutcomes.map(outcome => (
											<DiscreteProbabilityCell
												key={outcome.id}
												outcomeId={outcome.id}
												probabilities={probabilities}
											/>
										))}
										<td
											className={`bg-background-default rounded-sm px-2 py-1 text-center text-sm ${
												isValid ? 'text-text-tertiary' : 'text-red-600'
											}`}
										>
											{isValid ? '∑=1' : '∑≠1'}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
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
