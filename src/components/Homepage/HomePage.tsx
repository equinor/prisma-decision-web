import { Search } from '@equinor/eds-core-react';
import { useState } from 'react';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { ProjectCard } from './ProjectCard';

export const HomePage = () => {
	const { projects } = useGetProjects();
	const [searchTerm, setSearchTerm] = useState('');
	const filteredProjects = projects.filter(project =>
		project.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);
	useGetIssues();
	return (
		<div className='mx-auto w-[min(1600px,_90%)]'>
			<div className='flex flex-col gap-12'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>
						Welcome to the Decision Optimization Tool!
					</h1>
					<p className='text-text-tertiary'>
						DOT (Decision Optimization Tool) is a powerful platform that helps teams
						make better decisions through structured analysis, evaluation, and
						collaboration. It turns complex scenarios into clear, actionable
						insights—enabling confident, informed choices.
					</p>
				</div>

				<div className='flex flex-col gap-4'>
					<Search
						className='xl:w-[350px]'
						placeholder='Search projects...'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
					/>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
						{filteredProjects.map(project => (
							<ProjectCard key={project.id} project={project} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
