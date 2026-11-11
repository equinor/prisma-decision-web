import { Button } from '@equinor/eds-core-react';
import { useBulkUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { Issue } from '../../../../validators';
import { useProbablityTable } from './useProbablityTable';

export const ResetProbabilitiesButton = ({ issue }: { issue: Issue }) => {
	const { childOutcomes, rows } = useProbablityTable(issue);
	const { mutate: updateProbabilities, isPending } = useBulkUpdateDiscreteProbabilities();
	const probabilities = rows.flatMap(row => row.values);
	const hasNonZeroValue = probabilities.some(probability => probability.probability !== 0);
	if (!childOutcomes.length) return null;
	return (
		<Button
			variant='outlined'
			disabled={!hasNonZeroValue || isPending}
			onClick={() =>
				updateProbabilities(
					probabilities.map(probability => ({ ...probability, probability: 0 })),
				)
			}
		>
			Reset all
		</Button>
	);
};
