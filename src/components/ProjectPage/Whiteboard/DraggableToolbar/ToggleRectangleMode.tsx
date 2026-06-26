import { Button, Icon } from '@equinor/eds-core-react';
import { rectangleIcon } from '../../../../icons';
import { useAtom } from 'jotai';
import { activeToolAtom } from '../activeToolAtom';
import { useHotkey } from '@tanstack/react-hotkeys';

export const ToggleRectangleMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'rectangle';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'rectangle');
	};
	useHotkey('2', onChange);
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Rectangle mode'
		>
			<Button className='relative px-1.5!'>
				<Icon data={rectangleIcon} />
				<p className='absolute right-0.5 -bottom-0.5 text-xs'>2</p>
			</Button>
		</Button.Toggle>
	);
};
