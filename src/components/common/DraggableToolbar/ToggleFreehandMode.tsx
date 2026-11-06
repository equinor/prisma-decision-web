import { Icon } from '@equinor/eds-core-react/next';
import { edit_text } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useAtom } from 'jotai';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { ToolbarToolButton } from './Toolbar';

export const ToggleFreehandMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'freehand';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'freehand');
	};

	useHotkey('5', onChange);

	return (
		<ToolbarToolButton
			icon
			selected={checked}
			shortcut='5'
			tooltip='Freehand mode'
			onClick={onChange}
		>
			<Icon data={edit_text} />
		</ToolbarToolButton>
	);
};
