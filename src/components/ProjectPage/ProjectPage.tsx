import { Button, Icon } from '@equinor/eds-core-react';
import { view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, Outlet, useLocation } from 'react-router';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { NetworkIcon } from '../common/NetworkIcon';

export const ProjectPage = () => {
	const location = useLocation();
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
		<div className='mx-auto w-[min(1600px,_90%)]'>
			<div className='flex flex-col gap-6'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				</div>
				<div className='flex justify-between'>
					<Button.Toggle selectedIndexes={[showIssuesView ? 1 : 0]}>
						<Button as={Link} to={`/project/${selectedProject.id}`}>
							Project Details
						</Button>
						<Button as={Link} to='issues'>
							Issues
						</Button>
					</Button.Toggle>
					{showIssuesView && (
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
					)}
				</div>
				<Outlet />
			</div>
		</div>
	);
};
