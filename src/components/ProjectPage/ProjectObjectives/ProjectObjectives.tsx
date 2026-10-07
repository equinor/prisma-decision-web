import { Table } from '@equinor/eds-core-react';
import { useSelectedProjectObjectives } from '../../../hooks/useSelectedProjectObjectives';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useSelectedProject } from '../ProjectContext';
import { CreateObjective } from './CreateObjective';
import { ObjectiveRow } from './ObjectiveRow';

export const ProjectObjectives = () => {
	const selectedProject = useSelectedProject();
	const { selectedObjectives, isLoading } = useSelectedProjectObjectives();

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
					<div className='outline-background-medium w-full overflow-x-auto overflow-y-hidden rounded-sm outline-1'>
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
									<ObjectiveRow
										key={objective.id + index}
										objective={objective}
									/>
								))}
							</Table.Body>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
};
