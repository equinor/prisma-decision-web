import { Checkbox, Icon } from '@equinor/eds-core-react';
import { IconData } from '@equinor/eds-icons';
import { useUpdateStrategy } from '../../../hooks/api/useUpdateStrategy';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { Strategy as StrategyType } from '../../../validators';
import { DecisionCard } from '../../common/Cards/DecisionCard';
import { DeleteStrategyDialog } from './DeleteStrategyDialog';
import { EditStrategy } from './EditStrategy';

export const Strategy = ({
	strategy,
	onClickAddToStrategyTable,
	selectedStrategyIds,
	strategyIcon,
	expected_utility: expected_utility,
}: {
	strategy: StrategyType;
	onClickAddToStrategyTable: (id: string) => void;
	selectedStrategyIds: Set<string>;
	strategyIcon: IconData;
	expected_utility?: number;
}) => {
	const issues = useSelectedProjectIssues().filter(
		x =>
			x.type === 'Decision' &&
			x.decision.type === 'Focus' &&
			(x.boundary === 'in' || x.boundary === 'on'),
	);
	const project = useSelectedProject();
	const { mutate: updateStrategy } = useUpdateStrategy();

	if (!project) return;
	return (
		<div key={strategy.id} className='flex w-full flex-col gap-1'>
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-4'>
					<Icon data={strategyIcon} />
					<div>
						<h3 className='text-xl font-semibold'>{strategy.name}</h3>
						<h4 className='text-text-tertiary text-sm'>{strategy.rationale}</h4>
						{expected_utility !== undefined && (
							<p className='text-text-secondary text-sm'>
								Expected utility:{' '}
								<span className='font-medium'>{expected_utility.toFixed(3)}</span>
							</p>
						)}
					</div>
				</div>
				<div className='flex items-center'>
					<Checkbox
						label='Add to compare'
						className='flex-row-reverse'
						checked={selectedStrategyIds?.has(strategy.id)}
						onChange={() => onClickAddToStrategyTable(strategy.id)}
					/>
					<EditStrategy strategy={strategy} />
					<DeleteStrategyDialog strategy={strategy} />
				</div>
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
											...strategy,
											options: [...strategy.options, option],
										});
										return;
									}
									if (option.id === existingOption.id) {
										updateStrategy({
											...strategy,
											options: strategy.options.filter(
												o => o.id !== option.id,
											),
										});
									} else {
										updateStrategy({
											...strategy,
											options: strategy.options.map(o =>
												o.decision_id === issue.decision.id ? option : o,
											),
										});
									}
								}}
								key={issue.id}
								issue={issue}
								expanded={true}
								canExpand={false}
								className='mas max-w-24 cursor-default'
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};
