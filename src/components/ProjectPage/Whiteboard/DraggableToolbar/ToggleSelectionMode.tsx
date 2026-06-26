import { Button } from '@equinor/eds-core-react';
import { useAtom } from 'jotai';
import { DragToSelectIcon } from '../../../common/DragToSelectIcon';
import { activeToolAtom } from '../activeToolAtom';

export const ToggleSelectionMode = () => {
	const [activeToolbar, setActiveToolbar] = useAtom(activeToolAtom);
	const checked = activeToolbar === 'selection';
	const onChange = () => {
		setActiveToolbar(checked ? 'pan' : 'selection');
	};
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Toggle selection mode'
		>
			<Button className='px-1.5!'>
				<DragToSelectIcon />
			</Button>
		</Button.Toggle>
	);
};
