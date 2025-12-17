import { Button, Icon } from '@equinor/eds-core-react';
import { download } from '@equinor/eds-icons';
import { Link } from 'react-router';
import { Project } from '../../validators';
import { DeleteProjectDialog } from '../common/DeleteProjectDialog';

export const ProjectCard = ({ project }: ProjectCardProps) => {
	return (
		<Link to={`/project/${project.id}/`}>
			<div
				className='bg-background-default outline-background-medium
				hover:bg-background-light shadow-tile grid h-28 cursor-pointer
				grid-rows-[1fr_auto] rounded-sm transition-all duration-1000 hover:outline'
			>
				<div className='p-4'>
					<h2 className='truncate text-lg font-semibold'>{project.name}</h2>
				</div>
				<div className='border-background-medium flex justify-between border-t px-2 py-2'>
					<DeleteProjectDialog project={project} />
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
