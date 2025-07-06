import { Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';

export const ValueList = () => {
	const values = useSelectedProjectIssues().filter(issue => issue.type === 'Value');
	const [open, setOpen] = useLocalStorage('valuesOpen', true);

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
                 items-start gap-6 rounded-sm p-6'
			>
				<CollapsibleTrigger asChild>
					<div className='w-full cursor-pointer'>
						<h2 className='text-2xl font-semibold'>Values</h2>
						<p className='text-text-tertiary'>
							Manage the potential costs and benefits of this project
						</p>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent asChild>
					<div className='outline-background-medium w-full overflow-auto rounded-sm outline-1'>
						<Table className='w-full'>
							<Table.Head>
								<Table.Row>
									<Table.Cell className='w-21 px-0! pl-5!'>Actions</Table.Cell>
									<Table.Cell>Name</Table.Cell>
									<Table.Cell>Description</Table.Cell>
									<Table.Cell>Boundary</Table.Cell>
									<Table.Cell>Date Added</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{values.map(issue => (
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
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
};
