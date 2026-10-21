import { Icon } from '@equinor/eds-core-react/next';
import { pan_tool } from '@equinor/eds-icons';
import { useAtom } from 'jotai';
import { useHotkey } from '@tanstack/react-hotkeys';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { ToolbarToolButton } from './Toolbar';

export const TogglePanMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'pan';
	const onChange = () => {
		setActiveToolbar(checked ? 'selection' : 'pan');
	};
	useHotkey('1', onChange);
	return (
		<ToolbarToolButton
			icon
			selected={checked}
			shortcut='1'
			tooltip='Pan mode'
			onClick={onChange}
		>
			<Icon data={pan_tool} />
		</ToolbarToolButton>
	);
};
