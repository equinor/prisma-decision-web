import { Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
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
				<CollapsibleTrigger asChild disabled={!hasUncertainties}>
					<button className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-end text-start disabled:cursor-default disabled:opacity-50'>
						<div>
							<h2 className='text-2xl font-semibold'>Uncertainties</h2>
							<p className='text-text-tertiary'>
								Manage the uncertainties that need to be considered in this project
							</p>
						</div>
						{!hasUncertainties && (
							<p className='text-text-tertiary '>No uncertainties added</p>
						)}
					</button>
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
												<ul className='flex flex-col gap-2 py-4'>
													<li className='bg-background-light flex items-center justify-between rounded-sm px-2 py-1'>
														<p>Outcome 1</p>
														<p>20%</p>
													</li>
													<li className='bg-background-light flex items-center justify-between rounded-sm px-2 py-1'>
														<p>Outcome 1</p>
														<p>20%</p>
													</li>
													<li className='bg-background-light flex items-center justify-between rounded-sm px-2 py-1'>
														<p>Outcome 1</p>
														<p>20%</p>
													</li>
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
