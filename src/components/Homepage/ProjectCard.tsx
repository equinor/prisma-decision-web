import { Tooltip } from '@equinor/eds-core-react';
import { Link, useNavigate } from 'react-router';
import { Project } from '../../validators';
import { DeleteProjectDialog } from '../common/DeleteProjectDialog';
import { DuplicateProjectDialog } from '../common/DuplicateProjectDialog';
import { DownloadProjectJsonButton } from '../common/DownloadProjectJsonButton';

export const ProjectCard = ({ project }: ProjectCardProps) => {
	const navigate = useNavigate();

	return (
		<Link to={`/project/${project.id}/`}>
			<div
				className='bg-background-default outline-background-medium
                hover:bg-background-light shadow-tile grid h-full cursor-pointer
                grid-rows-[1fr_auto] overflow-hidden rounded-sm transition-all duration-1000
                hover:outline'
			>
				<div className='overflow-hidden p-4'>
					<Tooltip title={`Click to navigate to project: ${project.name}`}>
						<h2 className='text-lg font-semibold wrap-break-word'>{project.name}</h2>
					</Tooltip>
					{project.parent_project_name && (
						<p className='text-text-secondary text-sm wrap-break-word'>
							This is the child project of{' '}
							<Tooltip
								title={`Click to navigate to parent project: ${project.parent_project_name}`}
							>
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
							</Tooltip>
						</p>
					)}
				</div>
				<div className='border-background-medium flex justify-between gap-2 border-t px-4 py-2'>
					<Tooltip title='Click to duplicate project'>
						<div onClick={e => e.stopPropagation()}>
							<DuplicateProjectDialog project={project} />
						</div>
					</Tooltip>
					<DownloadProjectJsonButton project={project} />
					<Tooltip title='Click to delete project'>
						<div onClick={e => e.stopPropagation()}>
							<DeleteProjectDialog project={project} />
						</div>
					</Tooltip>
				</div>
			</div>
		</Link>
	);
};

type ProjectCardProps = {
	project: Project;
};
