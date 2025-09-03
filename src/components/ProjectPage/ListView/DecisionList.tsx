import { Button, Icon, Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';
import { chevron_up } from '@equinor/eds-icons';

export const DecisionList = () => {
	const decisions = useSelectedProjectIssues().filter(issue => issue.type === 'Decision');
	const [open, setOpen] = useLocalStorage('decisionsOpen', true);
	const hasDecisions = decisions.length > 0;
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
								<h2 className='text-2xl font-semibold'>Decisions</h2>
								<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
									{decisions.length}
								</span>
							</div>
							<p className='text-text-tertiary'>
								Manage the decisions that need to be made in this project
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
					{hasDecisions && (
						<div className='outline-background-medium w-full overflow-auto rounded-sm outline-1'>
							<Table className='w-full table-fixed'>
								<Table.Head>
									<Table.Row>
										<Table.Cell className='w-21'></Table.Cell>
										<Table.Cell className='w-2/10'>Name</Table.Cell>
										<Table.Cell className='w-4/10'>Description</Table.Cell>
										<Table.Cell className='w-2/10'>Alternatives</Table.Cell>
										<Table.Cell className='w-1/10'>Boundary</Table.Cell>
										<Table.Cell className='w-1/10'>Date Added</Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body>
									{decisions.map(issue => (
										<Table.Row key={issue.id}>
											<Table.Cell className='px-0! pl-1!'>
												<div className='flex'>
													<EditIssueModal issue={issue} />
													<DeleteIssueDialog issue={issue} />
												</div>
											</Table.Cell>
											<Table.Cell>{issue.name}</Table.Cell>
											<Table.Cell className='max-w-md py-2!'>
												{issue.description}
											</Table.Cell>
											<Table.Cell>
												<ul className='flex flex-col gap-2 py-4 text-sm'>
													{issue.decision.options.map(option => (
														<li
															key={option.id}
															className='bg-background-light flex justify-between rounded-sm px-2 py-1'
														>
															<p>{option.name}</p>
															<p>{option.utility}</p>
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
