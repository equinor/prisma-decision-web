import { useFormContext } from 'react-hook-form';
import { Strategy } from '../../../validators';
import { Tooltip } from '@equinor/eds-core-react';

export const StrategyIconColorPicker = () => {
	const { register } = useFormContext<Strategy>();
	return (
		<Tooltip title='Select icon strategy color'>
			<input
				type='color'
				className='border-primary-resting mt-4 size-9 rounded-sm border'
				{...register('icon_color')}
			/>
		</Tooltip>
	);
};
