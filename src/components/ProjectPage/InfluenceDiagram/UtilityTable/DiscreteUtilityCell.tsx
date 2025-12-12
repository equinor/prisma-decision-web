import { TextField } from '@equinor/eds-core-react';
import { useUpdateDiscreteUtilities } from '../../../../hooks/api/useUpdateDiscreteUtilities';
import { DiscreteUtility } from '../../../../validators';

export const DiscreteUtilityCell = ({ utilityId, discreteUtilities }: DiscreteProbabilityCell) => {
	const du = discreteUtilities.find(p => p.utility_id === utilityId);
	const { mutate } = useUpdateDiscreteUtilities();
	if (!du) return;
	return (
		<td className='text-right' key={du.id}>
			<TextField
				type='number'
				onBlur={e => {
					const newValue = isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber;
					if (newValue === du.utility_value) return;
					mutate({ ...du, utility_value: newValue });
				}}
				inputMode='decimal'
				className='nopan nodrag [&_input]:bg-background-default! w-24!'
				defaultValue={Math.round((du.utility_value || 0) * 100) / 100}
				data-probability-id={du?.id}
			/>
		</td>
	);
};

type DiscreteProbabilityCell = {
	discreteUtilities: DiscreteUtility[];
	utilityId: string;
};
