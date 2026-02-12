import { useUpdateStrategy } from '../../../hooks/api/useUpdateStrategy';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { Strategy as StrategyType } from '../../../validators';
import { DecisionCard } from '../../common/Cards/DecisionCard';
import { DeleteStrategyDialog } from './DeleteStrategyDialog';

export const Strategy = ({ strategy }: { strategy: StrategyType }) => {
	const issues = useSelectedProjectIssues().filter(
		x => x.type === 'Decision' && x.decision.type === 'Focus' && x.boundary === 'in',
	);
	const project = useSelectedProject();
	const { mutate: updateStrategy } = useUpdateStrategy();
	if (!project) return;
	return (
		<div key={strategy.id} className='flex w-full flex-col gap-1'>
			<div className='flex items-center justify-between gap-2'>
				<div>
					<h3 className='text-xl font-semibold'>{strategy.name}</h3>
					<h4 className='text-text-tertiary text-sm '>{strategy.rationale}</h4>
				</div>
				<DeleteStrategyDialog strategy={strategy} />
			</div>
			<div className='bg-background-light overflow-auto rounded-sm p-2'>
				<div className='flex min-w-max gap-2'>
					{issues.map(issue => {
						const existingOption = strategy.options.find(
							o => o.decision_id === issue.decision.id,
						);
						return (
							<DecisionCard
								selectedOption={existingOption}
								onClickOption={option => {
									if (!existingOption) {
										updateStrategy({
											...project,
											strategies: project.strategies.map(projectStrategy => {
												if (projectStrategy.id !== strategy.id)
													return projectStrategy;
												return {
													...projectStrategy,
													options: [...projectStrategy.options, option],
												};
											}),
										});
										return;
									}
									updateStrategy({
										...project,
										strategies: project.strategies.map(projectStrategy => {
											if (projectStrategy.id !== strategy.id)
												return projectStrategy;
											return {
												...projectStrategy,
												options: projectStrategy.options.map(o =>
													o.decision_id === issue.decision.id
														? option
														: o,
												),
											};
										}),
									});
								}}
								key={issue.id}
								issue={issue}
								expanded={true}
								className='mas max-w-24 cursor-default'
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};
