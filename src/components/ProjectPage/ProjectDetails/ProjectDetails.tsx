import { ProjectInformation } from '../../common/ProjectInformation/ProjectInformation';
import { ProjectTabs } from '../ProjectTabs';
import { ScenarioSelector } from '../ScenarioSelector';

export const ProjectDetails = () => {
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex w-full items-center justify-between'>
				<ProjectTabs />
				<ScenarioSelector />
			</div>
			<ProjectInformation />
		</div>
	);
};
