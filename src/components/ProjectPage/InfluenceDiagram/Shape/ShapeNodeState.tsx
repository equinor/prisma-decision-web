import { Button, Icon } from '@equinor/eds-core-react/next';
import { arrow_drop_down } from '@equinor/eds-icons';
import { CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useExpandCard } from '../../../../hooks/useExpandCard';
import { useSelectedProjectRestrictionTables } from '../../../../hooks/useSelectedProjectRestrictionTables';
import { cn } from '../../../../utils/cn';
import { IssueCardStates } from '../../../common/Cards/IssueCard';
import { useIssueCardContext } from '../../../common/Cards/useIssueCardContext';

export const ShapeNodeState = () => {
	const { issue, selectedState, sortedStates } = useIssueCardContext();
	const { expanded } = useExpandCard(issue.id);
	const { fullyRestrictedStateIds } = useSelectedProjectRestrictionTables();
	if (issue.type !== 'Decision' && issue.type !== 'Uncertainty') return null;

	const label = issue.type === 'Decision' ? 'Forced decision' : 'Hard evidence';

	return (
		<IssueCardStates disabledStateIds={fullyRestrictedStateIds}>
			<div
				className={cn(
					'nodrag nopan nowheel order-first flex justify-center self-center px-2 pb-2',
					selectedState ? '-mt-2.5 -mb-2' : '-mb-2 pt-2',
					selectedState || expanded ? 'pointer-events-auto' : 'influence-shape-control',
				)}
				onClick={event => event.stopPropagation()}
			>
				<CollapsibleTrigger asChild>
					<Button
						variant='secondary'
						size='small'
						tone={selectedState ? 'accent' : 'neutral'}
						aria-label={`${label}: ${issue.name}`}
						className='h-auto! max-w-80 rounded-full! bg-(--eds-color-bg-floating)! px-3! py-0.5! text-sm!'
					>
						<span
							className={
								selectedState
									? 'min-w-0 wrap-anywhere whitespace-normal'
									: 'whitespace-nowrap'
							}
						>
							{selectedState?.name ??
								`${sortedStates.length} ${sortedStates.length === 1 ? 'state' : 'states'}`}
						</span>
						<Icon data={arrow_drop_down} size='sm' className='shrink-0' />
					</Button>
				</CollapsibleTrigger>
			</div>
		</IssueCardStates>
	);
};
