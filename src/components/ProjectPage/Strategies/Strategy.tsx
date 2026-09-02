import { Checkbox, Icon } from '@equinor/eds-core-react';
import { useUpdateStrategy } from '../../../hooks/api/useUpdateStrategy';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import {
	IssueCard,
	IssueCardContent,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardHeader,
	IssueCardMenu,
	IssueCardStates,
} from '../../common/Cards/IssueCard';
import type { Strategy as StrategyType, Issue, Option } from '../../../validators';
import { EVMetrics } from '../../common/EVMetrics';
import { DeleteStrategyDialog } from './DeleteStrategyDialog';
import { EditStrategy } from './EditStrategy';
import { strategyIcons } from './icons';
import { useSelectedProjectRestrictionTables } from '../../../hooks/useSelectedProjectRestrictionTables';

export const Strategy = ({
	strategy,
	onClickAddToStrategyTable,
	selectedStrategyIds,
}: {
	strategy: StrategyType;
	onClickAddToStrategyTable: (id: string) => void;
	selectedStrategyIds: Set<string>;
}) => {
	const { mutate: updateStrategy } = useUpdateStrategy();
	const { fullyRestrictedStateIds } = useSelectedProjectRestrictionTables();
	const selectedEvidence = [
		{
			evidence_id: strategy.id,
			state_ids: strategy.options.map(option => option.id),
			expected_utility: 0,
		},
	];

	const issues = useSelectedProjectIssues().filter(
		x =>
			x.type === 'Decision' &&
			x.decision.type === 'Focus' &&
			(x.boundary === 'in' || x.boundary === 'on'),
	);

	const onStateClick = (issue: Issue, state: Option) => {
		const existingOption = strategy.options.find(o => o.decision_id === issue.decision.id);
		if (!existingOption) {
			updateStrategy({
				...strategy,
				options: [...strategy.options, state],
			});
			return;
		}
		if (state.id === existingOption.id) {
			updateStrategy({
				...strategy,
				options: strategy.options.filter(o => o.id !== state.id),
			});
		} else {
			updateStrategy({
				...strategy,
				options: strategy.options.map(o =>
					o.decision_id === issue.decision.id ? state : o,
				),
			});
		}
	};

	return (
		<div key={strategy.id} className='flex w-full flex-col gap-1'>
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-4'>
					<Icon data={strategyIcons[strategy.icon]} color={strategy.icon_color} />
					<div className='flex flex-wrap items-center gap-3'>
						<div>
							<h3 className='text-xl font-semibold'>{strategy.name}</h3>
							<h4 className='text-text-tertiary text-sm'>{strategy.rationale}</h4>
						</div>
						<EVMetrics selectedEvidence={selectedEvidence} />
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
							<IssueCard
								key={issue.id}
								selectedState={existingOption}
								className='mas max-w-24 cursor-default'
								issue={issue}
								onClickState={state => onStateClick(issue, state as Option)}
							>
								<IssueCardHeader>
									<IssueCardMenu>
										<IssueCardEditMenuItem />
										<IssueCardDeleteMenuItem />
									</IssueCardMenu>
								</IssueCardHeader>
								<IssueCardContent />
								<IssueCardStates
									expandedProp
									disabledStateIds={fullyRestrictedStateIds}
								/>
							</IssueCard>
						);
					})}
				</div>
			</div>
		</div>
	);
};
