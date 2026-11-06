import { Icon } from '@equinor/eds-core-react/next';
import { checkbox_outline } from '@equinor/eds-icons';
import { useAtom } from 'jotai';
import { useHotkey } from '@tanstack/react-hotkeys';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { ToolbarToolButton } from './Toolbar';

export const ToggleRectangleMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'rectangle';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'rectangle');
	};
	useHotkey('2', onChange);
	return (
		<ToolbarToolButton
			icon
			selected={checked}
			shortcut='2'
			tooltip='Rectangle mode'
			onClick={onChange}
		>
			<Icon data={checkbox_outline} />
		</ToolbarToolButton>
	);
};
