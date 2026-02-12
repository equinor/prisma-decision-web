import { Table } from '@equinor/eds-core-react';
import { CreateObjective } from './CreateObjective';
import { DeleteObjectiveDialog } from './DeleteObjectiveDialog';
import { format } from 'date-fns';
import { EditObjectiveDialog } from './EditObjectiveDialog';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const ProjectObjectives = () => {
	const project = useSelectedProject();
	const objectives = project?.objectives || [];
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex w-full items-center justify-end'>
				<CreateObjective />
			</div>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
			>
				<div className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-center'>
					<div>
						<div className='flex gap-2'>
							<h2 className='text-2xl font-semibold'>Objectives</h2>
							<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
								{objectives.length}
							</span>
						</div>
						<p className='text-text-tertiary'>
							Define the objectives that will help achieve the desired outcome
						</p>
					</div>
				</div>
				{objectives.length > 0 && (
					<div className='outline-background-medium w-full rounded-sm outline-1'>
						<Table className='w-full table-fixed'>
							<Table.Head>
								<Table.Row>
									<Table.Cell className='w-20'></Table.Cell>
									<Table.Cell className='w-2/9'>Name</Table.Cell>
									<Table.Cell className='w-5/9'>Description</Table.Cell>
									<Table.Cell className='w-2/9'>Type</Table.Cell>
									<Table.Cell className='w-1/9 truncate'>Date Created</Table.Cell>
									<Table.Cell className='w-1/9 truncate'>Date Updated</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{objectives.map(objectives => (
									<Table.Row key={objectives.id}>
										<Table.Cell className='px-0! pl-1!'>
											<div className='flex items-center'>
												<EditObjectiveDialog objective={objectives} />
												<DeleteObjectiveDialog objective={objectives} />
											</div>
										</Table.Cell>
										<Table.Cell>{objectives.name}</Table.Cell>
										<Table.Cell>{objectives.description}</Table.Cell>
										<Table.Cell className='truncate'>
											{objectives.type}
										</Table.Cell>
										<Table.Cell className='truncate'>
											{objectives.created_at
												? format(objectives.created_at, 'yyyy-MM-dd')
												: '-'}
										</Table.Cell>
										<Table.Cell className='truncate'>
											{objectives.updated_at
												? format(objectives.updated_at, 'yyyy-MM-dd')
												: '-'}
										</Table.Cell>
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
