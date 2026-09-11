import { TextField } from '@equinor/eds-core-react';
import { useUpdateDiscreteUtilities } from '../../../../hooks/api/useUpdateDiscreteUtilities';
import { DiscreteUtility } from '../../../../validators';
import { useState } from 'react';

export const DiscreteUtilityCell = ({ utilityId, discreteUtilities }: DiscreteProbabilityCell) => {
	const du = discreteUtilities.find(p => p.utility_id === utilityId);
	const [newValue, setNewValue] = useState(
		String(Math.round((du?.utility_value || 0) * 100) / 100),
	);
	const { mutate } = useUpdateDiscreteUtilities();
	if (!du) return;
	return (
		<td className='text-right'>
			<TextField
				type='number'
				onChange={e => setNewValue(e.target.value)}
				onBlur={() => {
					const parsedValue = Number.parseFloat(newValue) || 0;
					setNewValue(String(parsedValue));
					if (parsedValue === du.utility_value) return;
					mutate({ ...du, utility_value: parsedValue });
				}}
				inputMode='decimal'
				className='nopan nodrag [&_input]:bg-background-default! w-full'
				value={newValue}
				data-probability-id={du?.id}
				step={0.01}
			/>
		</td>
	);
};

type DiscreteProbabilityCell = {
	discreteUtilities: DiscreteUtility[];
	utilityId: string;
};
