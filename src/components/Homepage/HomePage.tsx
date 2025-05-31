import { Button, Search } from '@equinor/eds-core-react';
import { ProjectCard } from './ProjectCard';

export const HomePage = () => {
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
					<div className='flex flex-col justify-between gap-4 md:flex-row'>
						<Button.Toggle
							selectedIndexes={[0]}
							className='grid! grid-cols-3 md:inline-flex'
						>
							<Button>All projects</Button>
							<Button>Open</Button>
							<Button>Restricted</Button>
						</Button.Toggle>
						<Search className='xl:w-[350px]' placeholder='Search projects...' />
					</div>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
						<ProjectCard />
						<ProjectCard />
						<ProjectCard />
						<ProjectCard />
						<ProjectCard />
						<ProjectCard />
						<ProjectCard />
					</div>
				</div>
			</div>
		</div>
	);
};
