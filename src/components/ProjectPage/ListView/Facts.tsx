import { Button, Icon, Table } from '@equinor/eds-core-react';
import { delete_forever, edit } from '@equinor/eds-icons';
import { Issue } from '../ProjectPage';

export const Facts = ({ issues }: FactsProps) => {
	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
                 items-start gap-6 rounded-sm p-6'
		>
			<div>
				<h2 className='text-2xl font-semibold'>Facts</h2>
				<p className='text-text-tertiary'>The objective facts about the project</p>
			</div>
			<div className='outline-background-medium w-full rounded-sm outline-1'>
				<Table className='w-full'>
					<Table.Head>
						<Table.Row>
							<Table.Cell className='w-21 px-0! pl-5!'>Actions</Table.Cell>
							<Table.Cell>Name</Table.Cell>
							<Table.Cell>Description</Table.Cell>
							<Table.Cell>Boundry</Table.Cell>
							<Table.Cell>Date Added</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{issues.map(issue => (
							<Table.Row key={issue.id}>
								<Table.Cell className='px-0! pl-1!'>
									<Button variant='ghost_icon'>
										<Icon data={edit} />
									</Button>
									<Button variant='ghost_icon'>
										<Icon data={delete_forever} />
									</Button>
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
		</div>
	);
};

type FactsProps = {
	issues: Issue[];
};
