import { Icon } from '@equinor/eds-core-react';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { Strategy } from '../../../validators';
import { strategyIcons } from './icons';

export const StrategyTable = ({ strategies }: { strategies: Strategy[] }) => {
	const issues = useSelectedProjectIssues().filter(
		x =>
			x.type === 'Decision' &&
			x.decision.type === 'Focus' &&
			(x.boundary === 'in' || x.boundary === 'on'),
	);
	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
            items-start gap-4 rounded-sm p-4'
		>
			<div>
				<div className='flex gap-2'>
					<h2 className='text-2xl font-semibold'>Strategy Table</h2>
				</div>
				<p className='text-text-tertiary'>
					Visualize how your strategies select different options across your decisions
				</p>
			</div>
			<div className='flex flex-wrap items-center gap-3'>
				{strategies.map(strategy => (
					<div key={strategy.id} className='flex items-center gap-2 text-sm'>
						{strategyIcons[strategy.icon] && (
							<Icon data={strategyIcons[strategy.icon]} />
						)}
						<span>{strategy.name}</span>
					</div>
				))}
			</div>
			<div className='bg-background-light w-full overflow-auto rounded-sm p-2'>
				<div className='flex min-w-max gap-2'>
					{issues.map(issue => (
						<div
							key={issue.id}
							className='bg-background-default shadow-tile flex min-w-60.25 flex-col gap-2 rounded-sm p-2'
						>
							<div>
								<div className='max-w-52 text-sm font-bold whitespace-nowrap'>
									{issue.name}
								</div>
								<div className='text-text-tertiary line-clamp-1 max-w-56 text-sm'>
									{issue.description}
								</div>
							</div>
							<div className='flex flex-col gap-1'>
								{issue.decision.options.map(option => {
									const selectedByStrategies = strategies.filter(strategy =>
										strategy.options.some(
											selectedOption => selectedOption.id === option.id,
										),
									);
									return (
										<div
											key={option.id}
											className='bg-background-light flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1 text-sm'
										>
											<span>{option.name}</span>
											<div className='flex flex-wrap items-center justify-end gap-1'>
												{selectedByStrategies.map(strategy => (
													<Icon
														key={strategy.id}
														data={strategyIcons[strategy.icon]}
													/>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
