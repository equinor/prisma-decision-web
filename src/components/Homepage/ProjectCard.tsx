import { Button, Chip, CircularProgress, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, download } from '@equinor/eds-icons';
import { Link } from 'react-router';
import { Project } from '../../validators';
import { useDeleteProject } from '../../hooks/api/useDeleteProject';

export const ProjectCard = ({ project }: ProjectCardProps) => {
	const { mutate: deleteProject, isPending } = useDeleteProject();
	return (
		<Link to={`/project/${project.id}`}>
			<div
				className='bg-background-default outline-background-medium
				hover:bg-background-light shadow-tile grid h-[180px] cursor-pointer
				grid-rows-[1fr_auto] rounded-sm transition-all duration-1000 hover:outline'
			>
				<div className='p-6'>
					<div className='flex justify-between gap-5'>
						<h2 className='truncate text-lg font-semibold'>{project.name}</h2>
						<Chip variant='active' className='dark:text-text-default!'>
							Open
						</Chip>
					</div>
					<p className='text-text-tertiary line-clamp-2'>{project.description}</p>
				</div>
				<div className='border-background-medium flex justify-between border-t-1 px-3 py-2'>
					<Button
						variant='ghost_icon'
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							deleteProject(project.id);
						}}
					>
						{isPending ? (
							<CircularProgress size={24} />
						) : (
							<Icon data={delete_to_trash} />
						)}
					</Button>
					<Button variant='ghost_icon'>
						<Icon data={download} />
					</Button>
				</div>
			</div>
		</Link>
	);
};

type ProjectCardProps = {
	project: Project;
};
