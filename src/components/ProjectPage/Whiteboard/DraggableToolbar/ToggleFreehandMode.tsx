import { Button, Icon } from '@equinor/eds-core-react';
import { edit_text } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useAtom } from 'jotai';
import { activeToolAtom } from '../activeToolAtom';

export const ToggleFreehandMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'freehand';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'freehand');
	};

	useHotkey('5', onChange);

	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Freehand mode'
		>
			<Button className='relative px-1.5!'>
				<Icon data={edit_text} />
				<p className='absolute right-0.5 -bottom-0.5 text-xs'>5</p>
			</Button>
		</Button.Toggle>
	);
};
