import { Button } from '@equinor/eds-core-react';
import { DragToSelectIcon } from '../../../common/DragToSelectIcon';

export const ToggleSelectionMode = ({ checked, onChange }: ToggleSelectionModeProps) => {
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

type ToggleSelectionModeProps = {
	checked: boolean;
	onChange: () => void;
};
