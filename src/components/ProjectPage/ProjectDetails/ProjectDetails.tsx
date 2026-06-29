import { Tooltip } from '@equinor/eds-core-react';
import { DeleteProjectDialog } from '../../common/DeleteProjectDialog';
import { DuplicateProjectDialog } from '../../common/DuplicateProjectDialog';
import { ExportProject } from '../../common/ExportProject';
import { ProjectInformation } from '../../common/ProjectInformation/ProjectInformation';
import { Link } from 'react-router';
import { useSelectedProject } from '../ProjectContext';

export const ProjectDetails = () => {
	const selectedProject = useSelectedProject();
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex justify-between'>
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
				<div className='flex items-end justify-end gap-2'>
					<ExportProject project={selectedProject} showLabel />
					<DuplicateProjectDialog project={selectedProject} showLabel />
					<DeleteProjectDialog project={selectedProject} showLabel />
				</div>
			</div>
			<ProjectInformation />
		</div>
	);
};
