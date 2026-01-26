import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { getDiagramIssueBorderColor } from '../../../../utils/getDiagramIssueBorderColor';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { getParentLabel } from '../ProbabilityTable/utils';
import { DiscreteUtilityCell } from './DiscreteUtilityCell';
import { useUtilityTable } from './useUtilityTable';
import { ParentTypeIndicator } from '../../../common/ParentTypeIndicator';

export const UtilityTable = ({ issue, selected, onClose }: UtilityTableProps) => {
	const { parents, parentRowSpans, rows, lookups } = useUtilityTable(issue);
	return (
		<CardContainer
			className={`absolute top-0 left-[calc(100%+8px)] w-auto rounded-sm border-2 px-2 pt-1 pb-2 ${getDiagramIssueBorderColor(issue.type, !!selected)}`}
		>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between pt-1 pb-2 pl-2'>
					<h6 className='leading-6 font-medium'>{`${issue.name} Utility Table`}</h6>
					<Button variant='ghost_icon' onClick={() => onClose?.(false)}>
						<Icon data={close} />
					</Button>
				</div>
				<div className='flex gap-4'>
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
								{rows.map(({ rowKey, utilities }, rowIndex) => (
									<tr key={rowKey}>
										{parents.map((parent, parentIndex) => {
											const rowSpan = parentRowSpans[parentIndex];
											const shouldRenderCell = rowIndex % rowSpan === 0;
											if (!shouldRenderCell) return null;

											const label = getParentLabel(
												utilities[0],
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

					{/* Child value metrics table */}
					<table className='bg-background-light border-separate border-spacing-2 rounded-sm'>
						<thead>
							<tr className='text-left text-[0.7rem]'>
								<th className='bg-background-default rounded-sm px-2 py-1 font-normal'>
									<div className='flex h-9.25 items-center truncate text-sm font-bold'>
										Default metric
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map(({ rowKey, utilities }) => {
								return (
									<tr key={rowKey}>
										{utilities.map(utility => (
											<DiscreteUtilityCell
												key={utility.id}
												utilityId={utility.utility_id}
												discreteUtilities={utilities}
											/>
										))}
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

type UtilityTableProps = {
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
