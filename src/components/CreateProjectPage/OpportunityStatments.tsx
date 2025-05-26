import { Button, Icon, Table, TextField } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';

export const OpportunityStatments = () => {
	const [open, setOpen] = useLocalStorage('opportunityStatmentsOpen', true);
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            items-start gap-6 rounded-sm p-6'
			>
				<CollapsibleTrigger asChild>
					<div className='w-full cursor-pointer'>
						<h2 className='text-2xl font-semibold'>Opportunity Statements</h2>
						<p className='text-text-tertiary'>
							Add statements that describe the opportunity or problem this project
							addresses
						</p>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent className='flex w-full flex-col gap-6'>
					<div className='grid w-full xl:grid-cols-[1fr_auto] xl:gap-4'>
						<TextField
							label='Add New Statement'
							placeholder='Enter opportunity statement...'
						/>
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
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
};
