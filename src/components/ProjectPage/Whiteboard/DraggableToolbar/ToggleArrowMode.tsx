import { Button, Icon } from '@equinor/eds-core-react';
import { useAtom } from 'jotai';
import { arrowIcon } from '../../../../icons';
import { activeToolAtom } from '../activeToolAtom';
import { useHotkey } from '@tanstack/react-hotkeys';

export const ToggleArrowMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'arrow';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'arrow');
	};
	useHotkey('3', onChange);
	return (
		<Button.Toggle onChange={onChange} selectedIndexes={checked ? [0] : []} title='Arrow mode'>
			<Button className='relative px-1.5!'>
				<Icon data={arrowIcon} />
				<p className='absolute right-0.5 -bottom-0.5 text-xs'>3</p>
			</Button>
		</Button.Toggle>
	);
};
