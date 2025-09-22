import { Table } from '@equinor/eds-core-react';
import { useSelectedScenario } from '../../../hooks/useSelectedScenario';
import { DeleteOpportunity } from './DeleteOpportunityDialog';
import { ProjectTabs } from '../ProjectTabs';
import { ScenarioSelector } from '../ScenarioSelector';
import { CreateOpportunity } from './CreateOpportunity';

export const ProjectOpportunities = () => {
	const scenario = useSelectedScenario();
	const opportunities = scenario?.opportunities || [];
	const hasOpportunities = opportunities.length > 0;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex w-full items-center justify-between'>
				<ProjectTabs />

				<div className='flex items-center gap-4'>
					<ScenarioSelector />
					<CreateOpportunity />
				</div>
			</div>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
			>
				<div className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-center'>
					<div>
						<div className='flex gap-2'>
							<h2 className='text-2xl font-semibold'>Opportunity Statements</h2>
							<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
								{opportunities.length}
							</span>
						</div>
						<p className='text-text-tertiary'>
							Statements that describe the opportunity or problem this project
							addresses
						</p>
					</div>
				</div>
				{hasOpportunities && (
					<div className='outline-background-medium w-full rounded-sm outline-1'>
						<Table className='w-full table-fixed'>
							<Table.Head>
								<Table.Row>
									<Table.Cell className='w-12'></Table.Cell>
									<Table.Cell className='w-1/3 md:w-3/9'>Name</Table.Cell>
									<Table.Cell className='w-1/3 md:w-5/9'>Description</Table.Cell>
									<Table.Cell className='w-1/3 md:w-2/9'>Date Added</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{opportunities.map(opportunity => (
									<Table.Row key={opportunity.id}>
										<Table.Cell className='px-0! pl-1!'>
											<div className='flex justify-center'>
												<DeleteOpportunity opportunity={opportunity} />
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
			</div>
		</div>
	);
};
