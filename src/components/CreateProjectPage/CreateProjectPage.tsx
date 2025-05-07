import { Button } from '@equinor/eds-core-react';
import { OpportunityStatments } from './OpportunityStatments';
import { ProjectInformation } from './ProjectInformation';
import { ProjectObjectives } from './ProjectObjectives';
import { Link } from 'react-router';

export const CreateProjectPage = () => {
	return (
		<div className='mx-auto w-[456px] xl:w-[936px] 2xl:w-[1416px]'>
			<div className='flex flex-col gap-6'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>Create New Project</h1>
					<p className='text-text-tertiary'>
						Fill in the details to create a new decision optimization project
					</p>
				</div>
				<ProjectInformation />
				<OpportunityStatments />
				<ProjectObjectives />
				<div className='-mt-2! flex justify-between'>
					<Button variant='outlined' color='danger' as={Link} to='/'>
						Cancel
					</Button>
					<Button>Create Project</Button>
				</div>
			</div>
		</div>
	);
};
