import { Switch } from '@equinor/eds-core-react';
import { useUpdateRestrictionEntries } from '../../../../hooks/api/useUpdateRestrictionEntries';
import { RestrictionEntry } from '../../../../validators';

export const RestrictionToggleCell = ({
	entry,
	parentState,
	childState,
}: RestrictionToggleCellProps) => {
	const { mutate: updateRestrictionEntry } = useUpdateRestrictionEntries();
	const isEnabled = entry?.restriction_value === 1;

	return (
		<td className='bg-background-default rounded-sm px-3 py-2 text-center'>
			<Switch
				aria-label={`${parentState.name} allows ${childState.name}`}
				className='nopan nodrag justify-center [&>label]:sr-only'
				checked={isEnabled}
				disabled={!entry}
				onChange={() => {
					if (!entry) return;
					updateRestrictionEntry({
						...entry,
						restriction_value: isEnabled ? 0 : 1,
						updated_at: new Date().toISOString(),
					});
				}}
			/>
		</td>
	);
};

type RestrictionToggleCellProps = {
	entry: RestrictionEntry | undefined;
	parentState: RestrictionState;
	childState: RestrictionState;
};

type RestrictionState = {
	id: string;
	name: string;
	isUncertainty: boolean;
};
