import { ProjectInformation } from '../common/ProjectInformation';

export const CreateProjectPage = () => {
	return (
		<div className='mx-auto w-[min(1600px,_90%)]'>
			<div className='flex flex-col gap-6'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>Create New Project</h1>
					<p className='text-text-tertiary'>
						Fill in the details to create a new decision optimization project
					</p>
				</div>
				<ProjectInformation />
			</div>
		</div>
	);
};
