import { Autocomplete, Button, Icon, Table, TextField } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';

export const ProjectObjectives = () => {
	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
            items-start gap-6 rounded-sm p-6'
		>
			<div>
				<h2 className='text-2xl font-semibold'>Project Objectives</h2>
				<p className='text-text-tertiary'>
					Define the objectives that will help achieve the desired outcome
				</p>
			</div>
			<div className='grid w-full grid-cols-1 gap-2 xl:grid-cols-[1fr_1fr_auto] xl:gap-4 2xl:grid-cols-[3fr_1fr_1fr_auto]'>
				<TextField
					label='Add New Statement'
					className='xl:col-span-3 2xl:col-span-1'
					placeholder='Enter opportunity statement...'
				/>
				<Autocomplete label='Category' options={['Strategic', 'Fundemantal', 'Mean']} />
				<TextField label='Label' placeholder='Enter label...' />
				<Button className='mt-4!'>
					<Icon data={add} />
					Add
				</Button>
			</div>
			<div className='outline-background-medium w-full rounded-sm outline-1'>
				<Table className='w-full'>
					<Table.Head>
						<Table.Row>
							<Table.Cell>Opportunity Statement</Table.Cell>
							<Table.Cell>Date Added</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						<Table.Row>
							<Table.Cell>Lorem ipsum dolor sit amet</Table.Cell>
							<Table.Cell>2023-05-01</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell>Lorem ipsum dolor sit amet</Table.Cell>
							<Table.Cell>2023-05-01</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table>
			</div>
		</div>
	);
};
