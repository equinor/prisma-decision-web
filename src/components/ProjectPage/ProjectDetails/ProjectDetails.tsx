import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { ProjectInformation } from '../../common/ProjectInformation/ProjectInformation';

export const ProjectDetails = () => {
	const selectedProject = useSelectedProject();
	return (
		<div className='flex flex-col gap-4'>
			<h1 className='text-3xl font-bold'>{selectedProject?.name}</h1>
			<ProjectInformation />
		</div>
	);
};
