import { Button, Icon, Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedScenario } from '../../../hooks/useSelectedScenario';
import { DeleteOpportunityStatment } from './DeleteOpportunityStatmentDialog';
import { chevron_up } from '@equinor/eds-icons';
import { OpportunityStatmentsForm } from './OpportunityStatmentsForm';

export const OpportunityStatments = () => {
	const [open, setOpen] = useLocalStorage('opportunityStatmentsOpen', true);
	const scenario = useSelectedScenario();
	const opportunities = scenario?.opportunities || [];
	const hasOpportunities = opportunities.length > 0;
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            items-start gap-4 rounded-sm p-4'
			>
				<CollapsibleTrigger asChild>
					<div className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-center'>
						<div>
							<div className='flex gap-2'>
								<h2 className='text-2xl font-semibold'>Opportunity Statements</h2>
								<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
									{opportunities.length}
								</span>
							</div>
							<p className='text-text-tertiary'>
								Add statements that describe the opportunity or problem this project
								addresses
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
