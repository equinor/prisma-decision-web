import { TextField, Tooltip } from '@equinor/eds-core-react';
import { useUpdateDiscreteProbabilities } from '../../../../hooks/api/useUpdateDiscreteProbabilities';
import { DiscreteProbability } from '../../../../validators';

export const DiscreteProbabilityCell = ({
	outcomeId,
	probabilities,
	disabledReason,
}: DiscreteProbabilityCell) => {
	const dp = probabilities.find(p => p.outcome_id === outcomeId);
	const { mutate } = useUpdateDiscreteProbabilities();
	if (!dp) return;

	return (
		<td className='text-right' key={dp.probability}>
			<Tooltip title={disabledReason} placement='top' disabled={!disabledReason}>
				<div>
					<TextField
						type='number'
						disabled={!!disabledReason}
						min={0}
						max={1}
						step='0.01'
						onBlur={e => {
							const newValue = isNaN(e.target.valueAsNumber)
								? 0
								: e.target.valueAsNumber;
							if (newValue === dp.probability) return;
							mutate({ ...dp, probability: newValue });
						}}
						inputMode='decimal'
						className='nopan nodrag [&_input]:bg-background-default!'
						defaultValue={Math.round((dp?.probability || 0) * 100) / 100}
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
