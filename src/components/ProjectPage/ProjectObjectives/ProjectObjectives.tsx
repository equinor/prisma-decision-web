import { Button, Icon, Table } from '@equinor/eds-core-react';
import { CreateObjective } from './CreateObjective';
import { DeleteObjectiveDialog } from './DeleteObjectiveDialog';
import { format } from 'date-fns';
import { EditObjectiveDialog } from './EditObjectiveDialog';
import { useSelectedProjectObjectives } from '../../../hooks/useSelectedProjectObjectives';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useSelectedProject } from '../ProjectContext';
import { arrow_down, arrow_up } from '@equinor/eds-icons';
import { useUpdateObjectives } from '../../../hooks/api/useUpdateObjective';
import { Objective } from '../../../validators';

export const ProjectObjectives = () => {
	const selectedProject = useSelectedProject();
	const { selectedObjectives, isLoading } = useSelectedProjectObjectives();
	const { mutate: updateObjectives } = useUpdateObjectives();
	const handleMoveObjective = (objective: Objective, direction: 'up' | 'down') => {
		const currentIndex = selectedObjectives.findIndex(item => item.id === objective.id);
		const adjacentIndex = currentIndex + (direction === 'up' ? -1 : 1);

		if (currentIndex === -1 || !selectedObjectives[adjacentIndex]) return;

		const reorderedObjectives = [...selectedObjectives];
		[reorderedObjectives[currentIndex], reorderedObjectives[adjacentIndex]] = [
			reorderedObjectives[adjacentIndex],
			reorderedObjectives[currentIndex],
		];

		updateObjectives(reorderedObjectives.map((item, index) => ({ ...item, ordering: index })));
	};

	if (isLoading) return <LoadingSpinner />;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex w-full items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
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
					<div className='outline-background-medium w-full overflow-auto rounded-sm outline-1'>
						<Table className='w-full'>
							<Table.Head>
								<Table.Row>
									<Table.Cell className='w-21 pl-1!'></Table.Cell>
									<Table.Cell className='min-w-40'>Name</Table.Cell>
									<Table.Cell className='min-w-96'>Description</Table.Cell>
									<Table.Cell className='w-30'>Type</Table.Cell>
									<Table.Cell className='w-34 whitespace-nowrap'>
										Date Created
									</Table.Cell>
									<Table.Cell className='w-34 whitespace-nowrap'>
										Date Updated
									</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{selectedObjectives.map((objective, index) => (
									<Table.Row key={objective.id + index}>
										<Table.Cell className='px-0! pl-1!'>
											<div className='flex items-center'>
												<EditObjectiveDialog objective={objective} />
												<DeleteObjectiveDialog objective={objective} />
												<Button
													variant='ghost_icon'
													aria-label={`Move ${objective.name} up`}
													disabled={index === 0}
													onClick={() =>
														handleMoveObjective(objective, 'up')
													}
												>
													<Icon data={arrow_up} />
												</Button>
												<Button
													variant='ghost_icon'
													aria-label={`Move ${objective.name} down`}
													disabled={
														index === selectedObjectives.length - 1
													}
													onClick={() =>
														handleMoveObjective(objective, 'down')
													}
												>
													<Icon data={arrow_down} />
												</Button>
											</div>
										</Table.Cell>
										<Table.Cell>{objective.name}</Table.Cell>
										<Table.Cell className='max-w-xl truncate'>
											{objective.description}
										</Table.Cell>
										<Table.Cell className='w-30'>{objective.type}</Table.Cell>
										<Table.Cell className='whitespace-nowrap'>
											{objective.created_at
												? format(objective.created_at, 'yyyy-MM-dd')
												: '-'}
										</Table.Cell>
										<Table.Cell className='whitespace-nowrap'>
											{objective.updated_at
												? format(objective.updated_at, 'yyyy-MM-dd')
												: '-'}
										</Table.Cell>
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
