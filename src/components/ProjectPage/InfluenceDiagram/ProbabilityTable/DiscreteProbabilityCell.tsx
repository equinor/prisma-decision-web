import { TextField, Tooltip } from '@equinor/eds-core-react';
import { useUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { DiscreteProbability } from '../../../../validators';
import { useState } from 'react';

export const DiscreteProbabilityCell = ({
	outcomeId,
	probabilities,
	disabledReason,
}: DiscreteProbabilityCell) => {
	const dp = probabilities.find(p => p.outcome_id === outcomeId);
	const [newValue, setNewValue] = useState(
		String(Math.round((dp?.probability || 0) * 100) / 100),
	);

	const { mutate } = useUpdateDiscreteProbabilities();
	if (!dp) return;

	return (
		<td className='text-right'>
			<Tooltip title={disabledReason} placement='top' disabled={!disabledReason}>
				<div>
					<TextField
						type='number'
						disabled={!!disabledReason}
						min={0}
						max={1}
						step='0.01'
						onChange={e => setNewValue(e.target.value)}
						onBlur={() => {
							const parsedValue = Number.parseFloat(newValue) || 0;
							setNewValue(String(parsedValue));
							if (parsedValue === dp.probability) return;
							mutate({ ...dp, probability: parsedValue });
						}}
						inputMode='decimal'
						className='nopan nodrag [&_input]:bg-background-default!'
						value={newValue}
					/>
				</div>
			</Tooltip>
		</td>
	);
};

type DiscreteProbabilityCell = {
	probabilities: DiscreteProbability[];
	outcomeId: string;
	disabledReason?: string;
};
