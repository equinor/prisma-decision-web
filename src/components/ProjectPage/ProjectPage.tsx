import { Outlet, useParams } from 'react-router';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetInfluenceNodes } from '../../hooks/api/useGetInfluenceNodes';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ProjectContext } from './ProjectContext';
import { BottomNavigation } from '../common/BottomNavigation';

export const ProjectPage = () => {
	const { projectId } = useParams<{ projectId: string }>();
	const { projects, isLoading: isLoadingProjects } = useGetProjects();
	const selectedProject = projects.find(project => project.id === projectId);
	const { isLoading: isLoadingIssues } = useGetIssues();
	const { isLoading: isLoadingEdges } = useGetEdges();
	const { isLoading: isLoadingNodes } = useGetInfluenceNodes();

	if (isLoadingIssues || isLoadingProjects || isLoadingEdges || isLoadingNodes)
		return <LoadingSpinner />;
	if (!selectedProject) return;

	return (
		<ProjectContext value={selectedProject}>
			<div className='mx-auto w-[min(2400px,90%)]'>
				<Outlet />
			</div>
			<BottomNavigation />
		</ProjectContext>
	);
};
