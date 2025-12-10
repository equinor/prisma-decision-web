import { TextField } from '@equinor/eds-core-react';
import { useUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { DiscreteProbability } from '../../../../validators';

export const DiscreteProbabilityCell = ({ outcomeId, probabilities }: DiscreteProbabilityCell) => {
	const dp = probabilities.find(p => p.outcome_id === outcomeId);
	const { mutate } = useUpdateDiscreteProbabilities();
	if (!dp) return;
	return (
		<td className='px-2 py-1 text-right' key={dp.probability}>
			<TextField
				type='number'
				min={0}
				max={1}
				step='0.01'
				onBlur={e => {
					const newValue = isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber;
					if (newValue === dp.probability) return;
					mutate({ ...dp, probability: newValue });
				}}
				inputMode='decimal'
				className='nopan nodrag w-24!'
				defaultValue={Math.round((dp?.probability || 0) * 100) / 100}
				data-probability-id={dp?.id}
			/>
		</td>
	);
};

type DiscreteProbabilityCell = {
	probabilities: DiscreteProbability[];
	outcomeId: string;
};
