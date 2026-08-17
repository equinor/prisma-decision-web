import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { getDiagramIssueBorderColor } from '../../../../utils/getDiagramIssueBorderColor';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { ParentTypeIndicator } from '../../../common/ParentTypeIndicator';
import { usePolicyTable } from './usePolicyTable';
import { cn } from '../../../../utils/cn';

export const PolicyTable = ({ issue, selected, onClose, ref }: PolicyTableProps) => {
	const { isFetching, optionIds, parents, parentRowSpans, rows, lookups } = usePolicyTable(issue);

	if (isFetching) {
		return (
			<div
				ref={ref}
				className='border-background-medium bg-background-default text-text-tertiary w-87.5 rounded-sm border border-dashed px-3 py-2 text-xs'
			>
				Loading policy table...
			</div>
		);
	}

	if (!rows.length) {
		return (
			<div
				ref={ref}
				className='border-background-medium bg-background-default text-text-tertiary w-87.5 rounded-sm border border-dashed px-3 py-2 text-xs'
			>
				No policy rows available for this decision.
			</div>
		);
	}

	return (
		<CardContainer
			ref={ref}
			className={`w-auto rounded-sm border-2 px-2 pt-1 pb-2 ${getDiagramIssueBorderColor(issue.type, !!selected)}`}
		>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between pt-1 pb-2 pl-2'>
					<h6 className='leading-6 font-medium'>{`${issue.name} Policy Table`}</h6>
					<Button variant='ghost_icon' onClick={() => onClose?.(false)}>
						<Icon data={close} />
					</Button>
				</div>
				<div
					className={cn('grid grid-cols-[auto_auto] gap-2', {
						'grid-cols-[auto]': parents.length === 0,
					})}
				>
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
								{rows.map((row, rowIndex) => (
									<tr key={row.rowKey}>
										{parents.map((parent, parentIndex) => {
											const rowSpan = parentRowSpans[parentIndex];
											const shouldRenderCell = rowIndex % rowSpan === 0;
											if (!shouldRenderCell) return null;

											const stateId =
												row.parentStateByIssueId[parent.issueId];
											const optionLabel =
												lookups.optionMap.get(stateId)?.name;
											const outcomeLabel =
												lookups.outcomeMap.get(stateId)?.name;
											const label = optionLabel || outcomeLabel || '—';

											return (
												<td
													key={`${row.rowKey}-${parent.issueId}`}
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

					<table className='bg-background-light border-separate border-spacing-2 rounded-sm'>
						<thead>
							<tr className='text-left text-[0.7rem]'>
								{optionIds.map(optionId => {
									const option = issue.decision.options.find(
										item => item.id === optionId,
									);
									if (!option) return null;
									return (
										<th
											key={option.id}
											className='bg-background-default rounded-sm px-2 py-1 font-normal'
										>
											<div className='text-text-tertiary text-[10px]'>
												{issue.name}
											</div>
											<div className='max-w-26 truncate text-sm font-bold'>
												{option.name}
											</div>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{rows.map(row => (
								<tr key={`values-${row.rowKey}`}>
									{optionIds.map(optionId => {
										const value = row.optionValues[optionId] ?? 0;
										return (
											<td
												key={`${row.rowKey}-${optionId}`}
												className='bg-background-default rounded-sm px-2 py-1 text-center text-sm'
											>
												{value === 1 ? '1' : '0'}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</CardContainer>
	);
};

type PolicyTableProps = {
	ref?: React.Ref<HTMLDivElement>;
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
