import { Chip } from '@equinor/eds-core-react';
import { Label } from '@equinor/eds-core-react';
import { useSelectedProject } from '../ProjectContext';

export const ProjectInformation = () => {
	const project = useSelectedProject();
	if (!project) return null;
	return (
		<div className='flex w-full flex-col gap-6 pt-4'>
			<div className='border-primary-resting grid grid-cols-[250px_auto] gap-8 border-b pb-6'>
				<h2 className='font-medium'>OPPORTUNITY STATEMENT</h2>
				<p className='text-text-secondary'>{project.opportunity_statement}</p>
			</div>
			<div className='border-primary-resting grid grid-cols-[250px_max-content_max-content] gap-8 border-b pb-6'>
				<h2 className='font-medium'>DETAILS</h2>
				<div>
					<Label label='End date' className='ml-0! text-sm!' />
					<p className='text-text-secondary font-medium'>
						{new Date(project.end_date).toLocaleDateString()}
					</p>
				</div>
				<div>
					<Label label='Visibility' className='ml-0! text-sm!' />
					<p className='text-text-secondary font-medium'>
						{project.public ? 'Public' : 'Private'}
					</p>
				</div>
			</div>
			<div className='border-primary-resting grid grid-cols-[250px_1fr] gap-8 border-b pb-6'>
				<h2 className='font-medium'>TEAM</h2>
				<ul className='flex flex-col gap-2'>
					{project.users.map(user => (
						<li key={user.id} className='grid grid-cols-[1fr_auto] items-center gap-4'>
							<p className='text-text-secondary font-medium'>{user.name}</p>
							<Chip
								variant='default'
								className='bg-primary-hover-alt! text-primary-hover!'
							>
								{user.role}
							</Chip>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
