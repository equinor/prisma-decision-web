import { Icon } from '@equinor/eds-core-react';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { Strategy } from '../../../validators';
import { IssueCard, IssueCardContent, IssueCardState } from '../../common/Cards/IssueCard';
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
							<Icon data={strategyIcons[strategy.icon]} color={strategy.icon_color} />
						)}
						<span>{strategy.name}</span>
					</div>
				))}
			</div>
			<div className='bg-background-light w-full overflow-auto rounded-sm p-2'>
				<div className='flex min-w-max gap-2'>
					{issues.map(issue => (
						<IssueCard key={issue.id} issue={issue} className='w-max pb-3'>
							<IssueCardContent />
							<ul className='flex flex-col gap-2 rounded-sm text-sm'>
								{issue.decision.options.map(option => {
									const selectedByStrategies = strategies.filter(strategy =>
										strategy.options.some(
											selectedOption => selectedOption.id === option.id,
										),
									);
									return (
										<IssueCardState key={option.id}>
											<span>{option.name}</span>
											<div className='flex flex-wrap items-center justify-end gap-1'>
												{selectedByStrategies.map(strategy => (
													<Icon
														key={strategy.id}
														data={strategyIcons[strategy.icon]}
														color={strategy.icon_color}
														size={20 as 24}
														className='h-max!'
													/>
												))}
											</div>
										</IssueCardState>
									);
								})}
							</ul>
						</IssueCard>
					))}
				</div>
			</div>
		</div>
	);
};
