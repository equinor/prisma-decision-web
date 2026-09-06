import { Button } from '@equinor/eds-core-react';
import { useAtom } from 'jotai';
import { useHotkey } from '@tanstack/react-hotkeys';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { DragIcon } from '../DragIcon';

export const TogglePanMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'pan';
	const onChange = () => {
		setActiveToolbar(checked ? 'selection' : 'pan');
	};
	useHotkey('1', onChange);
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Toggle pan mode'
		>
			<Button className='relative px-1.5!'>
				<DragIcon />
				<p className='absolute right-0.5 -bottom-0.5 text-xs'>1</p>
			</Button>
		</Button.Toggle>
	);
};
