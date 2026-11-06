import { Link, Outlet, useParams } from 'react-router';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetInfluenceNodes } from '../../hooks/api/useGetInfluenceNodes';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ProjectContext } from './ProjectContext';
import { BottomNavigation } from '../common/BottomNavigation';
import { Button } from '@equinor/eds-core-react';

export const ProjectPage = () => {
	const { projectId } = useParams<{ projectId: string }>();
	const { projects, isLoading: isLoadingProjects } = useGetProjects();
	const selectedProject = projects.find(project => project.id === projectId);
	const { isLoading: isLoadingIssues } = useGetIssues();
	const { isLoading: isLoadingEdges } = useGetEdges();
	const { isLoading: isLoadingNodes } = useGetInfluenceNodes();

	if (isLoadingIssues || isLoadingProjects || isLoadingEdges || isLoadingNodes)
		return <LoadingSpinner />;
	if (!selectedProject)
		return (
			<div className='mx-auto flex w-[min(1600px,90%)] flex-col items-center gap-2 py-20 text-center'>
				<h1 className='text-3xl font-bold'>Project not found</h1>
				<p className='text-text-tertiary'>
					The project may have been deleted or you may not have access to it.
				</p>
				<Button
					as={Link}
					className='text-primary-resting mt-4 font-medium hover:underline'
					to='/'
				>
					Back to projects
				</Button>
			</div>
		);

	return (
		<ProjectContext value={selectedProject}>
			<div className='mx-auto w-[min(2400px,90%)]'>
				<Outlet />
			</div>
			<BottomNavigation />
		</ProjectContext>
	);
};
