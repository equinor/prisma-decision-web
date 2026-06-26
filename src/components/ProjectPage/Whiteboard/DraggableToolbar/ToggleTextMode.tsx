import { Button, Icon } from '@equinor/eds-core-react';
import { title } from '@equinor/eds-icons';
import { useAtom } from 'jotai';
import { activeToolAtom } from '../activeToolAtom';
import { useHotkey } from '@tanstack/react-hotkeys';

export const ToggleTextMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'text';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'text');
	};
	useHotkey('4', onChange);
	return (
		<Button.Toggle onChange={onChange} selectedIndexes={checked ? [0] : []} title='Text mode'>
			<Button className='relative px-1.5!'>
				<Icon data={title} />
				<p className='absolute right-0.5 -bottom-0.5 text-xs'>4</p>
			</Button>
		</Button.Toggle>
	);
};
