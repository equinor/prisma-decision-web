import { Button, Icon } from '@equinor/eds-core-react';
import { view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, Outlet, useLocation } from 'react-router';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { useSelectedScenario } from '../../hooks/useSelectedScenario';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { NetworkIcon } from '../common/NetworkIcon';
import { CreateIssues } from './CreateIssueForm';
import { ScenarioSelector } from './ScenarioSelector';

export const ProjectPage = () => {
	const location = useLocation();
	const selectedScenario = useSelectedScenario();
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');

	const showIssuesView = location.pathname.includes('issues');
	const selectedProject = useSelectedProject();
	const { isLoading: isLoadingProjects } = useGetProjects();
	const { isLoading: isLoadingIssues } = useGetIssues();

	let activeView = 0;
	if (issueView === 'table') activeView = 1;
	if (issueView === 'diagram') activeView = 2;
	if (isLoadingIssues || isLoadingProjects) return <LoadingSpinner />;
	if (!selectedProject) return;

	return (
		<div className='mx-auto w-[min(2400px,_90%)]'>
			<div className='flex flex-col gap-4'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				</div>
				<div className='flex justify-between gap-8'>
					<Button.Toggle selectedIndexes={[showIssuesView ? 1 : 0]}>
						<Button
							as={Link}
							to={`/project/${selectedProject.id}/${selectedScenario?.id}`}
						>
							Project Details
						</Button>
						<Button
							as={Link}
							to='issues'
							onClick={() => {
								setIssuesView('list');
							}}
						>
							Issues
						</Button>
					</Button.Toggle>
					<div className='flex w-full items-center'>
						<div className='flex flex-1 justify-center'>
							<ScenarioSelector />
						</div>

						{showIssuesView && (
							<>
								<CreateIssues />
								<Button.Toggle selectedIndexes={[activeView]}>
									<Button onClick={() => setIssuesView('list')}>
										<Icon data={view_list} />
									</Button>
									<Button onClick={() => setIssuesView('table')}>
										<Icon data={view_column} />
									</Button>
									<Button onClick={() => setIssuesView('diagram')}>
										<NetworkIcon />
									</Button>
								</Button.Toggle>
							</>
						)}
					</div>
				</div>
				<Outlet />
			</div>
		</div>
	);
};
