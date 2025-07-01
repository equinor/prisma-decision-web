import { Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { ProjectObjectivesForm } from './ProjectObjectivesForm';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const ProjectObjectives = () => {
	const [open, setOpen] = useLocalStorage('projectObjectivesOpen', true);
	const project = useSelectedProject();
	const objectives = project?.scenarios[0].objectives || [];
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-6 rounded-sm p-6'
			>
				<CollapsibleTrigger asChild>
					<div className='w-full cursor-pointer'>
						<h2 className='text-2xl font-semibold'>Project Objectives</h2>
						<p className='text-text-tertiary'>
							Define the objectives that will help achieve the desired outcome
						</p>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent className='flex w-full flex-col gap-6'>
					<ProjectObjectivesForm />
					<div className='outline-background-medium w-full rounded-sm outline-1'>
						<Table className='w-full'>
							<Table.Head>
								<Table.Row>
									<Table.Cell>Opportunity Statement</Table.Cell>
									<Table.Cell>Date Added</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{objectives.map(objectives => (
									<Table.Row key={objectives.id}>
										<Table.Cell>{objectives.name}</Table.Cell>
										<Table.Cell>{objectives.description}</Table.Cell>
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
