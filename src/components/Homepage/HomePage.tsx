import { Banner, Button, Icon, Search } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import { useState } from 'react';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { ProjectCard } from './ProjectCard';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetEdges } from '../../hooks/api/useGetEdges';

import { useGetInfluenceNodes } from '../../hooks/api/useGetInfluenceNodes';
import { CreateProject } from '../common/ProjectInformation/CreateProject';
import { ImportProject } from '../common/ProjectInformation/ImportProject';
import { isDev, isPublic, isTest } from '../../utils/getEnvironment';

export const HomePage = () => {
	const { projects } = useGetProjects();
	const [searchTerm, setSearchTerm] = useState('');
	const [isOpenBanner, setIsOpenBanner] = useState(
		isPublic() && !sessionStorage.getItem('demoBannerDismissed'),
	);
	const filteredProjects = projects.filter(project =>
		project.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);
	useGetIssues();
	useGetEdges();
	useGetInfluenceNodes();
	return (
		<div className='mx-auto w-[min(1600px,90%)]'>
			<div className='flex flex-col gap-12'>
				{isOpenBanner && (
					<Banner>
						<Banner.Icon variant='warning'>
							<Icon data={info_circle} />
						</Banner.Icon>
						<Banner.Message>
							This is a demo version. Do not enter sensitive data — all information
							may be visible to other users.
						</Banner.Message>
						<Banner.Actions>
							<Button
								variant='ghost'
								onClick={() => {
									sessionStorage.setItem('demoBannerDismissed', 'true');
									setIsOpenBanner(false);
								}}
							>
								Dismiss
							</Button>
						</Banner.Actions>
					</Banner>
				)}
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
							{(isDev() || isTest() || isPublic()) && <ImportProject />}
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
