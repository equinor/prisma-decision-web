import { Icon } from '@equinor/eds-core-react/next';
import { select_all } from '@equinor/eds-icons';
import { useAtom } from 'jotai';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { ToolbarToolButton } from './Toolbar';

export const ToggleSelectionMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'selection';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'selection');
	};
	return (
		<ToolbarToolButton icon selected={checked} tooltip='Selection mode' onClick={onChange}>
			<Icon data={select_all} />
		</ToolbarToolButton>
	);
};
