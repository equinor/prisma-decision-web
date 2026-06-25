import { Search } from '@equinor/eds-core-react';
import { useState } from 'react';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { ProjectCard } from './ProjectCard';

import { useGetInfluenceNodes } from '../../hooks/api/useGetInfluenceNodes';
import { isProd } from '../../utils/getEnvironment';
import { CreateProject } from '../common/ProjectInformation/CreateProject';
import { ImportProject } from '../common/ProjectInformation/ImportProject';
import { useGetStrategies } from '../../hooks/api/useGetStrategies';
import { useGetObjectives } from '../../hooks/api/useGetObjectives';

export const HomePage = () => {
	const { projects } = useGetProjects();
	const [searchTerm, setSearchTerm] = useState('');
	const filteredProjects = projects.filter(project =>
		project.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	useGetIssues();
	useGetEdges();
	useGetInfluenceNodes();
	useGetStrategies();
	useGetObjectives();
	return (
		<div className='mx-auto w-[min(1600px,90%)]'>
			<div className='flex flex-col gap-12'>
				<div className='max-w-250'>
					<h1 className='text-3xl font-bold'>Welcome to Prisma!</h1>
					<p className='text-text-tertiary'>
						Prisma is a powerful platform that helps teams make better decisions through
						structured analysis, evaluation, and collaboration. It turns complex
						scenarios into clear, actionable insights—enabling confident, informed
						choices.
					</p>
				</div>

				<div className='flex flex-col gap-4'>
					<div className='flex justify-between'>
						<Search
							className='xl:w-87.5'
							placeholder='Search projects...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
						/>
						<div className='flex justify-between gap-2'>
							<CreateProject />
							{!isProd() && <ImportProject />}
						</div>
					</div>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5'>
						{filteredProjects.map(project => (
							<ProjectCard key={project.id} project={project} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
