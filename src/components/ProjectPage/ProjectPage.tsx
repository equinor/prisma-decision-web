import { Button, Icon } from '@equinor/eds-core-react';
import { share, view_column, view_list } from '@equinor/eds-icons';
import { useState } from 'react';
import { OpportunityStatments } from '../CreateProjectPage/OpportunityStatments';
import { ProjectInformation } from '../CreateProjectPage/ProjectInformation';
import { ProjectObjectives } from '../CreateProjectPage/ProjectObjectives';
import { Decisions } from './Decisions';
import { ProjectIssues } from './ProjectIssues';
import { Uncertainties } from './Uncertainties';
import { Values } from './Values';

export const ProjectPage = () => {
	const [selectedProjectView, setSelectedProjectView] = useState<'project' | 'issues'>('project');
	const selectedIndexes = selectedProjectView === 'project' ? [0] : [1];
	const showProjectView = selectedProjectView === 'project';
	const showIssuesView = selectedProjectView === 'issues';
	return (
		<div className='mx-auto w-[456px] xl:w-[936px] 2xl:w-[1416px]'>
			<div className='flex flex-col gap-6'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>The Used Car Buyer Problem</h1>
				</div>
				<div className='flex justify-between'>
					<Button.Toggle selectedIndexes={selectedIndexes}>
						<Button onClick={() => setSelectedProjectView('project')}>
							Project Details
						</Button>
						<Button onClick={() => setSelectedProjectView('issues')}>Issues</Button>
					</Button.Toggle>
					{showIssuesView && (
						<Button.Toggle>
							<Button>
								<Icon data={view_list} />
							</Button>
							<Button>
								<Icon data={view_column} />
							</Button>
							<Button>
								<Icon data={share} />
							</Button>
						</Button.Toggle>
					)}
				</div>
				{showProjectView && (
					<>
						<ProjectInformation />
						<OpportunityStatments />
						<ProjectObjectives />
					</>
				)}
				{showIssuesView && (
					<>
						<ProjectIssues />
						<Decisions />
						<Uncertainties />
						<Values />
					</>
				)}
			</div>
		</div>
	);
};
