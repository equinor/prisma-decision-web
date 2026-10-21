import { Icon } from '@equinor/eds-core-react/next';
import { title } from '@equinor/eds-icons';
import { useAtom } from 'jotai';
import { useHotkey } from '@tanstack/react-hotkeys';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { ToolbarToolButton } from './Toolbar';

export const ToggleTextMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'text';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'text');
	};
	useHotkey('4', onChange);
	return (
		<ToolbarToolButton
			icon
			selected={checked}
			shortcut='4'
			tooltip='Text mode'
			onClick={onChange}
		>
			<Icon data={title} />
		</ToolbarToolButton>
	);
};
