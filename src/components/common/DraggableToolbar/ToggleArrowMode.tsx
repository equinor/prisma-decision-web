import { Icon } from '@equinor/eds-core-react/next';
import { useAtom } from 'jotai';
import { useHotkey } from '@tanstack/react-hotkeys';
import { arrowIcon } from '../../../icons';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { ToolbarToolButton } from './Toolbar';

export const ToggleArrowMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'arrow';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'arrow');
	};
	useHotkey('3', onChange);
	return (
		<ToolbarToolButton
			icon
			selected={checked}
			shortcut='3'
			tooltip='Arrow mode'
			onClick={onChange}
		>
			<Icon data={arrowIcon} />
		</ToolbarToolButton>
	);
};
