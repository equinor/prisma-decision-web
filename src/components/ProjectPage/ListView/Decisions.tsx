import { Button, Icon, Table } from '@equinor/eds-core-react';
import { delete_forever, edit } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Issue } from '../ProjectPage';

export const Decisions = ({ issues }: DecisionsProps) => {
	const [open, setOpen] = useLocalStorage('decisionsOpen', true);
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
        		items-start gap-6 rounded-sm p-6'
			>
				<CollapsibleTrigger asChild>
					<div className='w-full cursor-pointer'>
						<h2 className='text-2xl font-semibold'>Decisions</h2>
						<p className='text-text-tertiary'>
							Manage the decisions that need to be made in this project
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
									<Table.Cell>Alternatives</Table.Cell>
									<Table.Cell>Boundry</Table.Cell>
									<Table.Cell>Date Added</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{issues.map(issue => (
									<Table.Row key={issue.id}>
										<Table.Cell className='px-0! pl-1!'>
											<div className='flex'>
												<Button variant='ghost_icon'>
													<Icon data={edit} />
												</Button>
												<Button variant='ghost_icon'>
													<Icon data={delete_forever} />
												</Button>
											</div>
										</Table.Cell>
										<Table.Cell>{issue.name}</Table.Cell>
										<Table.Cell className='max-w-md py-2!'>
											{issue.description}
										</Table.Cell>
										<Table.Cell>
											<ul className='flex flex-col gap-2 py-4'>
												<li>Option 1</li>
												<li>Option 2</li>
												<li>Option 3</li>
											</ul>
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

type DecisionsProps = {
	issues: Issue[];
};
