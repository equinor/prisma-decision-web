import { Button, Icon, Table } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSelectedScenario } from '../../../hooks/useSelectedScenario';
import { DeleteObjectiveDialog } from './DeleteObjectiveDialog';
import { ProjectObjectivesForm } from './ProjectObjectivesForm';
import { chevron_up } from '@equinor/eds-icons';

export const ProjectObjectives = () => {
	const [open, setOpen] = useLocalStorage('projectObjectivesOpen', true);
	const scenario = useSelectedScenario();
	const objectives = scenario?.objectives || [];
	const hasObjectives = objectives.length > 0;
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
								<h2 className='text-2xl font-semibold'>Project Objectives</h2>
								<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
									{objectives.length}
								</span>
							</div>
							<p className='text-text-tertiary'>
								Define the objectives that will help achieve the desired outcome
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
					<ProjectObjectivesForm />
					{hasObjectives && (
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
									{objectives.map(objectives => (
										<Table.Row key={objectives.id}>
											<Table.Cell className='px-0! pl-1!'>
												<div className='flex justify-center'>
													<DeleteObjectiveDialog objective={objectives} />
												</div>
											</Table.Cell>
											<Table.Cell>{objectives.name}</Table.Cell>
											<Table.Cell>{objectives.description}</Table.Cell>
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
