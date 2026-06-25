import { Table } from '@equinor/eds-core-react';
import { CreateObjective } from './CreateObjective';
import { DeleteObjectiveDialog } from './DeleteObjectiveDialog';
import { format } from 'date-fns';
import { EditObjectiveDialog } from './EditObjectiveDialog';
import { useSelectedProjectObjectives } from '../../../hooks/useSelectedProjectObjectives';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const ProjectObjectives = () => {
	const selectedProject = useSelectedProject();
	const { selectedObjectives, isLoading } = useSelectedProjectObjectives();
	if (isLoading) return <LoadingSpinner />;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex w-full items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject?.name}</h1>
				<CreateObjective />
			</div>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
			>
				<div className='grid w-full grid-cols-[1fr_auto] items-center'>
					<div>
						<div className='flex gap-2'>
							<h2 className='text-2xl font-semibold'>Objectives</h2>
							<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
								{selectedObjectives?.length ?? 0}
							</span>
						</div>
						<p className='text-text-tertiary'>
							Define the objectives that will help achieve the desired outcome
						</p>
					</div>
				</div>
				{selectedObjectives.length > 0 && (
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
								{selectedObjectives.map(objective => (
									<Table.Row key={objective.id}>
										<Table.Cell className='px-0! pl-1!'>
											<div className='flex items-center'>
												<EditObjectiveDialog objective={objective} />
												<DeleteObjectiveDialog objective={objective} />
											</div>
										</Table.Cell>
										<Table.Cell>{objective.name}</Table.Cell>
										<Table.Cell>{objective.description}</Table.Cell>
										<Table.Cell className='truncate'>
											{objective.type}
										</Table.Cell>
										<Table.Cell className='truncate'>
											{objective.created_at
												? format(objective.created_at, 'yyyy-MM-dd')
												: '-'}
										</Table.Cell>
										<Table.Cell className='truncate'>
											{objective.updated_at
												? format(objective.updated_at, 'yyyy-MM-dd')
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
