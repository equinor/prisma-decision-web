import { CreateIssues } from '../../common/CreateIssue';
import { useSelectedProject } from '../ProjectContext';
import { DecisionTypeView } from './DecisionTypeView';

export const DecisionHierarchy = () => {
	const selectedProject = useSelectedProject();

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-[32px] leading-10 font-bold'>{selectedProject.name}</h1>
				<CreateIssues />
			</div>
			<DecisionTypeView />
		</div>
	);
};
