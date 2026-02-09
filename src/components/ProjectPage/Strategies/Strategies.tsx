import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { CreateStrategy } from './CreateStrategy';
import { Strategy } from './Strategy';

export const Strategies = () => {
	const project = useSelectedProject();

	if (!project) return;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex w-full items-center justify-end'>
				<CreateStrategy />
			</div>
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	    items-start gap-4 rounded-sm p-4'
			>
				<div>
					<h2 className='text-2xl font-semibold'>Strategies</h2>
					<p className='text-text-tertiary'>
						Define and manage strategies for your decision optimization project
					</p>
				</div>
				{project.strategies.map(strategy => {
					return <Strategy key={strategy.id} strategy={strategy} />;
				})}
			</div>
		</div>
	);
};
