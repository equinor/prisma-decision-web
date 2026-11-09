import { useFormContext } from 'react-hook-form';
import { Strategy } from '../../../validators';
import { Tooltip } from '@equinor/eds-core-react';
import { cn } from '../../../utils/cn';

export const StrategyIconColorPicker = ({ className }: { className?: string }) => {
	const { register } = useFormContext<Strategy>();
	return (
		<Tooltip title='Select icon strategy color'>
			<input
				aria-label='Strategy icon color'
				type='color'
				className={cn('border-primary-resting mt-4 size-9 rounded-sm border', className)}
				{...register('icon_color')}
			/>
		</Tooltip>
	);
};
