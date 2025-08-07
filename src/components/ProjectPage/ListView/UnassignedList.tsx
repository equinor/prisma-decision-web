import { Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';

export const UnassignedList = () => {
	const unassigned = useSelectedProjectIssues().filter(issue => issue.type === 'Unassigned');
	const [open, setOpen] = useLocalStorage('unassignedOpen', true);
	const hasUnassigned = unassigned.length > 0;
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col items-start
                gap-4 rounded-sm'
			>
				<CollapsibleTrigger asChild disabled={!hasUnassigned}>
					<button
						className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-end p-4
					 	text-start disabled:cursor-default disabled:opacity-50'
					>
						<div>
							<h2 className='text-2xl font-semibold'>Unassigned</h2>
							<p className='text-text-tertiary'>
								Issues that have not been given a category yet
							</p>
						</div>
						{!hasUnassigned && (
							<p className='text-text-tertiary '>No unassigned added</p>
						)}
					</button>
				</CollapsibleTrigger>
				<CollapsibleContent asChild>
					{hasUnassigned && (
						<div className='outline-background-medium w-full overflow-auto rounded-sm p-4 outline-1'>
							<Table className='w-full'>
								<Table.Head>
									<Table.Row>
										<Table.Cell className='w-21'></Table.Cell>
										<Table.Cell>Name</Table.Cell>
										<Table.Cell>Description</Table.Cell>
										<Table.Cell>Boundary</Table.Cell>
										<Table.Cell>Date Added</Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body>
									{unassigned.map(issue => (
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
											<Table.Cell>Out</Table.Cell>
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
