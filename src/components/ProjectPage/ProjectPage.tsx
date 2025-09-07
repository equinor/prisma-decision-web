import { Button, Icon } from '@equinor/eds-core-react';
import { category, view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, Outlet, useLocation } from 'react-router';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { useSelectedScenario } from '../../hooks/useSelectedScenario';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CreateIssueForm } from './CreateIssueForm';
import { ScenarioSelector } from './ScenarioSelector';
import { CreateStrategyForm } from './CreateStrategyForm';

export const ProjectPage = () => {
	const location = useLocation();
	const selectedScenario = useSelectedScenario();

	let projectView = 0;
	if (location.pathname.includes('issues')) projectView = 1;
	if (location.pathname.includes('strategies')) projectView = 2;
	const showIssuesToolBar = location.pathname.includes('issues');
	const showStrategiesToolBar = location.pathname.includes('strategies');
	const selectedProject = useSelectedProject();

	const { isLoading: isLoadingProjects } = useGetProjects();
	const { isLoading: isLoadingIssues } = useGetIssues();
	const { isLoading: isLoadingEdges } = useGetEdges();

	if (isLoadingIssues || isLoadingProjects || isLoadingEdges) return <LoadingSpinner />;
	if (!selectedProject) return;

	return (
		<div className='mx-auto w-[min(2400px,_90%)]'>
			<div className='flex flex-col gap-4'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				</div>
				<div className='flex justify-between gap-8'>
					<Button.Toggle selectedIndexes={[projectView]}>
						<Button
							as={Link}
							to={`/project/${selectedProject.id}/${selectedScenario?.id}`}
						>
							Project Details
						</Button>
						<Button as={Link} to='issues'>
							Issues
						</Button>
						<Button as={Link} to='strategies'>
							Strategies
						</Button>
					</Button.Toggle>
					<div className='flex items-center gap-4'>
						<ScenarioSelector />

						{showIssuesToolBar && <IssuesToolBar />}
						{showStrategiesToolBar && <StrategiesToolBar />}
					</div>
				</div>
				<Outlet />
			</div>
		</div>
	);
};

const IssuesToolBar = () => {
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	let activeView = 0;
	if (issueView === 'table') activeView = 1;
	if (issueView === 'diagram') activeView = 2;

	return (
		<>
			<CreateIssueForm />
			<Button.Toggle selectedIndexes={[activeView]}>
				<Button onClick={() => setIssuesView('list')}>
					<Icon data={view_list} />
				</Button>
				<Button onClick={() => setIssuesView('table')}>
					<Icon data={view_column} />
				</Button>
				<Button onClick={() => setIssuesView('diagram')}>
					<Icon data={category} />
				</Button>
			</Button.Toggle>
		</>
	);
};

const StrategiesToolBar = () => {
	return <CreateStrategyForm />;
};
