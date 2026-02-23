import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { CreateStrategy } from './CreateStrategy';
import { Strategy } from './Strategy';

export const Strategies = () => {
	const selectedProject = useSelectedProject();

	if (!selectedProject) return;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				<CreateStrategy />
			</div>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
			>
				<div>
					<div className='flex gap-2'>
						<h2 className='text-2xl font-semibold'>Strategies</h2>
						<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
							{selectedProject.strategies.length}
						</span>
					</div>
					<p className='text-text-tertiary'>
						Define and manage strategies for your decision optimization project
					</p>
				</div>
				{selectedProject.strategies.map(strategy => {
					return <Strategy key={strategy.id} strategy={strategy} />;
				})}
			</div>
		</div>
	);
};
