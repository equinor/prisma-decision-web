import { Button, Icon, Table } from '@equinor/eds-core-react';
import { delete_forever, edit } from '@equinor/eds-icons';

export const Decisions = () => {
	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
                 items-start gap-6 rounded-sm p-6'
		>
			<div>
				<h2 className='text-2xl font-semibold'>Decisions</h2>
				<p className='text-text-tertiary'>
					Manage the decisions that need to be made in this project
				</p>
			</div>
			<div className='outline-background-medium w-full rounded-sm outline-1'>
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
						<Table.Row>
							<Table.Cell className='px-0! pl-1!'>
								<Button variant='ghost_icon'>
									<Icon data={edit} />
								</Button>
								<Button variant='ghost_icon'>
									<Icon data={delete_forever} />
								</Button>
							</Table.Cell>
							<Table.Cell>Lorem ipsum dolor sit amet</Table.Cell>
							<Table.Cell className='max-w-md py-2!'>
								Lorem ipsum dolor sit, amet consectetur adipisicing elit. Hic,
								voluptatem. Distinctio voluptatibus accusamus atque, veniam facilis
								nostrum dignissimos, ea, perspiciatis culpa consectetur temporibus
								deleniti quas vero reiciendis expedita quasi in!
							</Table.Cell>
							<Table.Cell>
								<ul className='list-disc p-4'>
									<li>Option 1</li>
									<li>Option 2</li>
									<li>Option 3</li>
								</ul>
							</Table.Cell>
							<Table.Cell>Out</Table.Cell>
							<Table.Cell>2023-05-01</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell className='px-0! pl-1!'>
								<Button variant='ghost_icon'>
									<Icon data={edit} />
								</Button>
								<Button variant='ghost_icon'>
									<Icon data={delete_forever} />
								</Button>
							</Table.Cell>
							<Table.Cell>Lorem ipsum dolor sit amet</Table.Cell>
							<Table.Cell>Lorem ipsum dolor sit amet</Table.Cell>
							<Table.Cell>
								<ul className='list-disc p-4'>
									<li>Option 1</li>
									<li>Option 2</li>
									<li>Option 3</li>
								</ul>
							</Table.Cell>
							<Table.Cell>In</Table.Cell>
							<Table.Cell>2023-05-01</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table>
			</div>
		</div>
	);
};
