import { useController, useFormContext } from 'react-hook-form';
import { Strategy } from '../../../validators';
import { ColorPickerLauncher } from '../../common/ColorPickerLauncher';

export const StrategyIconColorPicker = () => {
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
			className='mt-4 h-9'
		/>
	);
};
