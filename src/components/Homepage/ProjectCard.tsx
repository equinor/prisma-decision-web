import { Button, Icon } from '@equinor/eds-core-react';
import { download } from '@equinor/eds-icons';
import { Link, useNavigate } from 'react-router';
import { Project } from '../../validators';
import { DeleteProjectDialog } from '../common/DeleteProjectDialog';
import { DuplicateProjectDialog } from '../common/DuplicateProjectDialog';

export const ProjectCard = ({ project }: ProjectCardProps) => {
	const navigate = useNavigate();

	return (
		<Link to={`/project/${project.id}/`}>
			<div
				className='bg-background-default outline-background-medium
                hover:bg-background-light shadow-tile grid h-auto cursor-pointer
                grid-rows-[auto_auto] overflow-hidden rounded-sm transition-all duration-1000
                hover:outline'
			>
				<div className='overflow-hidden p-4'>
					<h2 className='text-lg font-semibold break-words'>{project.name}</h2>
					{project.parent_project_name && (
						<p className='text-text-secondary text-sm break-words'>
							This is the child project of{' '}
							<button
								type='button'
								onClick={e => {
									e.preventDefault();
									e.stopPropagation();
									navigate(`/project/${project.parent_project_id}/`);
								}}
								className='hover:text-primary-resting cursor-pointer border-none bg-transparent font-semibold text-inherit underline'
							>
								{project.parent_project_name}
							</button>
						</p>
					)}
				</div>
				<div className='border-background-medium flex justify-between gap-2 border-t px-4 py-2'>
					<div onClick={e => e.stopPropagation()}>
						<DuplicateProjectDialog project={project} />
					</div>
					<Button variant='ghost_icon' onClick={e => e.stopPropagation()}>
						<Icon data={download} />
					</Button>
					<div onClick={e => e.stopPropagation()}>
						<DeleteProjectDialog project={project} />
					</div>
				</div>
			</div>
		</Link>
	);
};

type ProjectCardProps = {
	project: Project;
};
