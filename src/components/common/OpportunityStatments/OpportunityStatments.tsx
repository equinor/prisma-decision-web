import { Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { OpportunityStatmentsForm } from './OpportunityStatmentsForm';
import { DeleteOpportunityStatment } from './DeleteOpportunityStatmentDialog';

export const OpportunityStatments = () => {
	const [open, setOpen] = useLocalStorage('opportunityStatmentsOpen', true);
	const project = useSelectedProject();
	const opportunities = project?.scenarios[0].opportunities || [];
	const hasOpportunities = opportunities.length > 0;
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            items-start gap-4 rounded-sm p-4'
			>
				<CollapsibleTrigger asChild>
					<div className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-end'>
						<div>
							<h2 className='text-2xl font-semibold'>Opportunity Statements</h2>
							<p className='text-text-tertiary'>
								Add statements that describe the opportunity or problem this project
								addresses
							</p>
						</div>
						{!hasOpportunities && (
							<p className='text-text-tertiary '>No opportunity statements added</p>
						)}
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent className='flex w-full flex-col gap-4'>
					<OpportunityStatmentsForm />
					{hasOpportunities && (
						<div className='outline-background-medium w-full rounded-sm outline-1'>
							<Table className='w-full table-fixed'>
								<Table.Head>
									<Table.Row>
										<Table.Cell className='w-10'></Table.Cell>
										<Table.Cell className='w-1/3 md:w-3/9'>Name</Table.Cell>
										<Table.Cell className='w-1/3 md:w-5/9'>
											Description
										</Table.Cell>
										<Table.Cell className='w-1/3 md:w-2/9'>
											Date Added
										</Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body>
									{opportunities.map(opportunity => (
										<Table.Row key={opportunity.id}>
											<Table.Cell className='px-0! pl-1!'>
												<div className='flex justify-center'>
													<DeleteOpportunityStatment
														opportunity={opportunity}
													/>
												</div>
											</Table.Cell>
											<Table.Cell>{opportunity.name}</Table.Cell>
											<Table.Cell>{opportunity.description}</Table.Cell>
											<Table.Cell></Table.Cell>
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
