import { Tooltip } from '@equinor/eds-core-react';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { ProjectInformation } from '../../common/ProjectInformation/ProjectInformation';
import { Link } from 'react-router';

export const ProjectDetails = () => {
	const selectedProject = useSelectedProject();
	if (!selectedProject) return null;
	return (
		<div className='flex flex-col gap-4'>
			<div>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				{selectedProject.parent_project_name && (
					<p className='text-text-secondary text-sm wrap-break-word'>
						Copied from{' '}
						<Tooltip
							title={`Click to navigate to original project: ${selectedProject.parent_project_name}`}
						>
							<Link
								to={`/project/${selectedProject.parent_project_id}/`}
								type='button'
								className='hover:text-primary-resting cursor-pointer border-none bg-transparent font-semibold text-inherit underline'
							>
								{selectedProject.parent_project_name}
							</Link>
						</Tooltip>
					</p>
				)}
			</div>
			<ProjectInformation />
		</div>
	);
};
