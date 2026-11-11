import { Button } from '@equinor/eds-core-react';
import { useBulkUpdateDiscreteUtilities } from '../../../../hooks/api/useUpdateDiscreteUtilities';
import { Issue } from '../../../../validators';
import { useUtilityTable } from './useUtilityTable';

export const ResetUtilitiesButton = ({ issue }: { issue: Issue }) => {
	const { rows } = useUtilityTable(issue);
	const { mutate: updateUtilities, isPending } = useBulkUpdateDiscreteUtilities();
	const utilities = rows.flatMap(row => row.values);
	const hasNonZeroValue = utilities.some(utility => utility.utility_value !== 0);
	return (
		<Button
			variant='outlined'
			disabled={!hasNonZeroValue || isPending}
			onClick={() =>
				updateUtilities(utilities.map(utility => ({ ...utility, utility_value: 0 })))
			}
		>
			Reset all
		</Button>
	);
};
