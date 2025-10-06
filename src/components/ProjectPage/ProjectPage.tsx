import { Outlet } from 'react-router';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetIssues, useGetNodes } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ProjectPage = () => {
	const selectedProject = useSelectedProject();
	const { isLoading: isLoadingProjects } = useGetProjects();
	const { isLoading: isLoadingIssues } = useGetIssues();
	const { isLoading: isLoadingEdges } = useGetEdges();
	const { isLoading: isLoadingNodes } = useGetNodes();

	if (isLoadingIssues || isLoadingProjects || isLoadingEdges || isLoadingNodes)
		return <LoadingSpinner />;
	if (!selectedProject) return;

	return (
		<div className='mx-auto w-[min(2400px,_90%)]'>
			<div className='mb-4 max-w-[1000px]'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
			</div>
			<Outlet />
		</div>
	);
};
