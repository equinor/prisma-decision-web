import { Button } from '@equinor/eds-core-react';
import { useBulkUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { isDevelopment } from '../../../../utils/getEnvironment';
import { Issue } from '../../../../validators';
import { useProbablityTable } from './useProbablityTable';

const getRandomProbabilities = (count: number): number[] => {
	const cutPoints = Array.from({ length: Math.max(0, count - 1) }, () =>
		Math.floor(Math.random() * 101),
	).sort((first, second) => first - second);
	const boundaries = [0, ...cutPoints, 100];

	return boundaries.slice(1).map((boundary, index) => (boundary - boundaries[index]) / 100);
};

export const RandomizeProbabilitiesButton = ({ issue }: { issue: Issue }) => {
	const { childOutcomes, rows, restrictedCells } = useProbablityTable(issue);
	const { mutate: updateProbabilities, isPending } = useBulkUpdateDiscreteProbabilities();
	const randomizeProbabilities = () => {
		const randomizedProbabilities = rows.flatMap(row => {
			const availableProbabilities = row.values.filter(
				probability => !restrictedCells.includes(probability.id),
			);
			const randomValues = getRandomProbabilities(availableProbabilities.length);
			const randomValueById = new Map(
				availableProbabilities.map((probability, index) => [
					probability.id,
					randomValues[index],
				]),
			);

			return row.values.map(probability => ({
				...probability,
				probability: randomValueById.get(probability.id) ?? 0,
			}));
		});

		updateProbabilities(randomizedProbabilities);
	};

	if (!isDevelopment() || !childOutcomes.length) return null;
	return (
		<Button
			variant='outlined'
			disabled={!rows.length || isPending}
			onClick={randomizeProbabilities}
		>
			Randomize
		</Button>
	);
};
