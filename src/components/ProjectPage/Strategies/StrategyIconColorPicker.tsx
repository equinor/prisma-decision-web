import { useController, useFormContext } from 'react-hook-form';
import { Strategy } from '../../../validators';
import { cn } from '../../../utils/cn';
import { ColorPickerLauncher } from '../../common/ColorPickerLauncher';

export const StrategyIconColorPicker = ({ className }: { className?: string }) => {
	const { control } = useFormContext<Strategy>();
	const {
		field: { value, onChange: onCommit },
	} = useController({
		name: 'icon_color',
		control,
	});

	return (
		<ColorPickerLauncher
			title='Choose strategy icon color'
			value={value ?? '#007079'}
			onChange={onCommit}
			className={cn('mt-4 h-9', className)}
		/>
	);
};
