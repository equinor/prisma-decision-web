import { Icon, Switch, Tooltip } from '@equinor/eds-core-react';
import { warning_outlined } from '@equinor/eds-icons';
import { RestrictionEntry } from '../../../../validators';
import { RestrictionToggleContext, RestrictionToggleViolation } from './useRestrictionToggle';

export const RestrictionToggleCell = ({
	entry,
	parentState,
	childState,
	onToggle,
	violation,
}: RestrictionToggleCellProps) => {
	const isEnabled = entry?.restriction_value === 1;

	return (
		<td className='bg-background-default relative rounded-sm px-3 py-2 text-center'>
			<Switch
				aria-label={`${parentState.name} allows ${childState.name}`}
				className='nopan nodrag justify-center [&>label]:sr-only'
				checked={isEnabled}
				disabled={!entry || violation?.blocksToggle}
				onChange={() => {
					if (!entry) return;
					onToggle({
						entry,
						parentStateName: parentState.name,
						childStateName: childState.name,
					});
				}}
			/>
			{violation && (
				<Tooltip title={violation.message} placement='top'>
					<span
						role='img'
						aria-label={
							violation.blocksToggle
								? 'Restriction not allowed'
								: 'Invalid restriction'
						}
						className='nopan nodrag absolute top-0.5 right-0.5 flex cursor-help'
					>
						<Icon data={warning_outlined} size={16} className='fill-warning-resting' />
					</span>
				</Tooltip>
			)}
		</td>
	);
};

type RestrictionToggleCellProps = {
	entry: RestrictionEntry | undefined;
	parentState: RestrictionState;
	childState: RestrictionState;
	onToggle: (context: RestrictionToggleContext) => void;
	violation?: RestrictionToggleViolation;
};

type RestrictionState = {
	id: string;
	name: string;
	isUncertainty: boolean;
};
