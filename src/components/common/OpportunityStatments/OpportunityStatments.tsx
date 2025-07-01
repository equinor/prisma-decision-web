import { Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { OpportunityStatmentsForm } from './OpportunityStatmentsForm';

export const OpportunityStatments = () => {
	const [open, setOpen] = useLocalStorage('opportunityStatmentsOpen', true);
	const project = useSelectedProject();
	const opportunities = project?.scenarios[0].opportunities || [];
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
					<OpportunityStatmentsForm />
					<div className='outline-background-medium w-full rounded-sm outline-1'>
						<Table className='w-full'>
							<Table.Head>
								<Table.Row>
									<Table.Cell>Opportunity Statement</Table.Cell>
									<Table.Cell>Date Added</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{opportunities.map(opportunity => (
									<Table.Row key={opportunity.id}>
										<Table.Cell>{opportunity.name}</Table.Cell>
										<Table.Cell>{opportunity.description}</Table.Cell>
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
