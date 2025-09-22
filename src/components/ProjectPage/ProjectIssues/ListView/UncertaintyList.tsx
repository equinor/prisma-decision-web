import { Button, Icon, Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { chevron_up } from '@equinor/eds-icons';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';

export const UncertaintyList = () => {
	const uncertainties = useSelectedProjectIssues().filter(issue => issue.type === 'Uncertainty');
	const [open, setOpen] = useLocalStorage('uncertaintiesOpen', true);
	const hasUncertainties = uncertainties.length > 0;
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
                 items-start gap-4 rounded-sm p-4'
			>
				<CollapsibleTrigger asChild>
					<div className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-center text-start'>
						<div>
							<div className='flex gap-2'>
								<h2 className='text-2xl font-semibold'>Uncertainties</h2>
								<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
									{uncertainties.length}
								</span>
							</div>
							<p className='text-text-tertiary'>
								Manage the uncertainties that need to be considered in this project
							</p>
						</div>
						<Button variant='ghost_icon'>
							<Icon
								data={chevron_up}
								data-open={open}
								className='data-[open="true"]:rotate-180'
							/>
						</Button>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent asChild>
					{hasUncertainties && (
						<div className='outline-background-medium w-full overflow-auto rounded-sm outline-1'>
							<Table className='w-full table-fixed'>
								<Table.Head>
									<Table.Row>
										<Table.Cell className='w-21'></Table.Cell>
										<Table.Cell className='w-2/10'>Name</Table.Cell>
										<Table.Cell className='w-4/10'>Description</Table.Cell>
										<Table.Cell className='w-2/10'>Outcomes</Table.Cell>
										<Table.Cell className='w-1/10'>Boundary</Table.Cell>
										<Table.Cell className='w-1/10'>Date Added</Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body>
									{uncertainties.map(issue => (
										<Table.Row key={issue.id}>
											<Table.Cell className='px-0! pl-1!'>
												<div className='flex'>
													<EditIssueModal issue={issue} />
													<DeleteIssueDialog issue={issue} />
												</div>
											</Table.Cell>
											<Table.Cell className='truncate'>
												{issue.name}
											</Table.Cell>
											<Table.Cell className='max-w-md py-2!'>
												{issue.description}
											</Table.Cell>
											<Table.Cell>
												<ul className='flex flex-col gap-2 rounded-sm py-4 text-sm'>
													{issue.uncertainty.outcomes.map(outcome => (
														<li
															key={outcome.id}
															className='bg-background-light grid grid-cols-[1fr_1fr_1fr]
															items-center justify-end gap-2 rounded-sm px-2 py-1'
														>
															<p className='truncate'>
																{outcome.name}
															</p>
															<p className='place-self-center truncate'>
																{outcome.probability * 100}%
															</p>
															<p className='place-self-end truncate'>
																{outcome.utility}
															</p>
														</li>
													))}
												</ul>
											</Table.Cell>
											<Table.Cell>{issue.boundary}</Table.Cell>
											<Table.Cell>2023-05-01</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table>
						</div>
					)}
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
};
